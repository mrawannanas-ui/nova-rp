"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { rules } from "@/lib/data";

const STEPS = [
  { n: 1, title: "المصادقة" },
  { n: 2, title: "القوانين" },
  { n: 3, title: "التحقق" },
  { n: 4, title: "الإكمال" },
];

const ERRORS = {
  config: "نظام التفعيل غير مُعد بعد. تواصل مع الإدارة.",
  denied: "تم إلغاء تسجيل الدخول بالديسكورد.",
  state: "انتهت صلاحية الطلب. حاول مرة أخرى.",
  nocode: "لم يصل رد من ديسكورد. حاول مرة أخرى.",
  oauth: "فشل الاتصال بديسكورد. حاول مرة أخرى.",
  ratelimit: "محاولات كثيرة من جهازك. حاول بعد قليل.",
};

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.164.293-.355.687-.487.998a18.27 18.27 0 0 0-5.142 0A12.6 12.6 0 0 0 10.44 3 19.74 19.74 0 0 0 6.678 4.372C2.95 9.884 1.95 15.26 2.45 20.56A19.9 19.9 0 0 0 8.48 23c.482-.66.912-1.36 1.282-2.096a12.9 12.9 0 0 1-2.02-.972c.17-.124.335-.253.494-.386 3.9 1.81 8.12 1.81 11.973 0 .161.133.326.262.494.386-.646.383-1.322.71-2.023.973.37.735.798 1.436 1.281 2.095a19.86 19.86 0 0 0 6.033-2.44c.586-6.144-1.002-11.47-4.195-16.19ZM8.68 16.64c-1.182 0-2.152-1.086-2.152-2.42 0-1.332.95-2.42 2.152-2.42 1.21 0 2.18 1.096 2.16 2.42 0 1.334-.95 2.42-2.16 2.42Zm6.64 0c-1.183 0-2.152-1.086-2.152-2.42 0-1.332.95-2.42 2.152-2.42 1.21 0 2.18 1.096 2.16 2.42 0 1.334-.95 2.42-2.16 2.42Z" />
    </svg>
  );
}

/** Cloudflare Turnstile — loads the script once and renders an explicit widget. */
function Turnstile({ siteKey, onToken }) {
  const holder = useRef(null);
  const widgetId = useRef(null);

  useEffect(() => {
    if (!siteKey || !holder.current) return;
    let cancelled = false;
    let timer = null;

    const render = () => {
      if (cancelled || !window.turnstile || !holder.current || widgetId.current !== null) return;
      widgetId.current = window.turnstile.render(holder.current, {
        sitekey: siteKey,
        theme: "dark",
        language: "ar",
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };

    if (window.turnstile) {
      render();
    } else if (!document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    } else {
      timer = setInterval(() => {
        if (window.turnstile) {
          clearInterval(timer);
          render();
        }
      }, 120);
    }

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      if (widgetId.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* widget already gone */
        }
        widgetId.current = null;
      }
    };
  }, [siteKey, onToken]);

  return <div className="vf-captcha" ref={holder} />;
}

/** Rules the player must scroll through before they can accept. */
function RulesBox({ onRead }) {
  const box = useRef(null);

  const onScroll = useCallback(() => {
    const el = box.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) onRead();
  }, [onRead]);

  // Short rule sets may not scroll at all — unlock immediately in that case.
  useEffect(() => {
    const el = box.current;
    if (el && el.scrollHeight <= el.clientHeight + 24) onRead();
  }, [onRead]);

  return (
    <div className="vf-rules" ref={box} onScroll={onScroll}>
      {rules.map((group, i) => (
        <div className="vf-rule-group" key={i}>
          <h3>
            <span className="num">{i + 1}</span>
            {group.title}
          </h3>
          <ul>
            {group.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
      <p className="vf-rules-end">— نهاية القوانين —</p>
    </div>
  );
}

function VerifyFlow() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({ captchaSiteKey: null, discordInvite: null });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [readRules, setReadRules] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  const [error, setError] = useState("");
  const [result, setResult] = useState({ joined: false, reverify: false });

  useEffect(() => {
    const code = params.get("error");
    if (code) setError(ERRORS[code] || "حدث خطأ. حاول مرة أخرى.");
  }, [params]);

  useEffect(() => {
    let alive = true;
    fetch("/api/verify/me")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setConfig({ captchaSiteKey: data.captchaSiteKey, discordInvite: data.discordInvite });
        if (data.user) {
          setUser(data.user);
          setStep(2);
        }
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const onToken = useCallback((token) => setCaptchaToken(token), []);
  const markRead = useCallback(() => setReadRules(true), []);

  const complete = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/verify/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captchaToken, acceptedRules: agreed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ. حاول مرة أخرى.");
        setCaptchaToken("");
        if (window.turnstile) window.turnstile.reset();
        return;
      }
      setResult({ joined: Boolean(data.joined), reverify: Boolean(data.reverify) });
      setStep(4);
    } catch {
      setError("تعذّر الاتصال بالسيرفر. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }, [captchaToken, agreed]);

  const hasCaptcha = Boolean(config.captchaSiteKey);
  const ready = hasCaptcha ? Boolean(captchaToken) : checked;

  return (
    <div className="vf-wrap">
      <div className="vf-banner">
        <img src="/NOVA-BANNER.png" alt="NOVA RP" onError={(e) => (e.currentTarget.style.display = "none")} />
      </div>

      <div className="vf-head">
        <img className="vf-logo" src="/NOVA-LOGO.png" alt="NOVA RP" />
        <span className="eyebrow">نظام التحقق</span>
        <h1 className="vf-title">مـقـاطـعـة نـوفـا</h1>
        <p className="vf-sub">فعّل حسابك علشان تظهرلك كل الرومات والقنوات داخل السيرفر</p>
      </div>

      <ol className="vf-steps">
        {STEPS.map((s) => (
          <li key={s.n} className={"vf-step" + (step === s.n ? " current" : step > s.n ? " done" : "")}>
            <span className="vf-step-num">{step > s.n ? "✓" : s.n}</span>
            <span className="vf-step-text">
              <b>الخطوة {s.n}</b>
              <small>{s.title}</small>
            </span>
          </li>
        ))}
      </ol>

      <div className="vf-card card">
        {error && <div className="vf-alert vf-alert-bad">{error}</div>}

        {loading && <p className="vf-loading">جاري التحميل…</p>}

        {!loading && step === 1 && (
          <div className="vf-pane">
            <div className="vf-pane-ico">🔐</div>
            <h2>سجّل دخولك بالديسكورد</h2>
            <p>هنطلب صلاحية قراءة اسمك وصورتك فقط، وإضافتك للسيرفر. مش هنقدر نقرأ رسايلك أبداً.</p>
            <a className="btn btn-primary btn-block vf-discord" href="/api/verify/login">
              <DiscordIcon />
              الدخول عبر ديسكورد
            </a>
          </div>
        )}

        {!loading && step === 2 && (
          <div className="vf-pane vf-pane-rules">
            {user && (
              <div className="vf-user">
                <img src={user.avatar} alt={user.username} />
                <span>
                  <b>{user.username}</b>
                  <small>@{user.tag}</small>
                </span>
              </div>
            )}
            <h2>قوانين السيرفر</h2>
            <p>اقرأ القوانين للآخر — التفعيل معناه موافقتك الكاملة عليها. الجهل بالقانون لا يُعفي من العقوبة.</p>

            <RulesBox onRead={markRead} />

            {!readRules && <p className="vf-hint">انزل لآخر القوانين علشان تقدر تكمّل ↓</p>}

            <label className={"vf-check" + (agreed ? " on" : "") + (readRules ? "" : " disabled")}>
              <input
                type="checkbox"
                checked={agreed}
                disabled={!readRules}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="vf-check-box">{agreed ? "✓" : ""}</span>
              <span className="vf-check-label">قرأت القوانين بالكامل وأوافق على الالتزام بها</span>
            </label>

            <button className="btn btn-primary btn-block" disabled={!agreed} onClick={() => setStep(3)}>
              متابعة ←
            </button>
          </div>
        )}

        {!loading && step === 3 && (
          <div className="vf-pane">
            <div className="vf-pane-ico">🛡️</div>
            <h2>التحقق الأمني</h2>
            <p>
              {hasCaptcha
                ? "أكمل التحقق الأمني تحت علشان نتأكد إنك لاعب حقيقي، وبعدها اضغط تفعيل."
                : "افتح المربع اللي تحت علشان نتأكد إنك لاعب حقيقي، وبعدها اضغط تفعيل."}
            </p>

            {hasCaptcha ? (
              <Turnstile siteKey={config.captchaSiteKey} onToken={onToken} />
            ) : (
              <label className={"vf-check" + (checked ? " on" : "")}>
                <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                <span className="vf-check-box">{checked ? "✓" : ""}</span>
                <span className="vf-check-label">أنا لست روبوت</span>
              </label>
            )}

            <button className="btn btn-primary btn-block" disabled={!ready || busy} onClick={complete}>
              {busy ? "جاري التفعيل…" : "تفعيل حسابي"}
            </button>
            <button className="vf-secondary" onClick={() => setStep(2)}>
              ← رجوع للقوانين
            </button>
          </div>
        )}

        {!loading && step === 4 && (
          <div className="vf-pane vf-success">
            <div className="vf-pane-ico vf-ok">✓</div>
            <h2>{result.reverify ? "حسابك مُفعّل بالفعل" : "تم التفعيل بنجاح"}</h2>
            <p>
              {result.joined
                ? "تمت إضافتك للسيرفر وإعطاؤك رتبة التفعيل."
                : "تم إعطاؤك رتبة التفعيل، ارجع للديسكورد وهتلاقي كل الرومات ظاهرة."}
            </p>
            {config.discordInvite && (
              <a className="btn btn-primary btn-block vf-discord" href={config.discordInvite} target="_blank" rel="noreferrer">
                <DiscordIcon />
                الرجوع إلى الديسكورد
              </a>
            )}
          </div>
        )}
      </div>

      <p className="vf-foot">
        NOVA RP — نظام التحقق الرسمي · <a href="/">الصفحة الرئيسية</a>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <main className="section vf-page">
      <div className="container">
        <Suspense fallback={<p className="vf-loading">جاري التحميل…</p>}>
          <VerifyFlow />
        </Suspense>
      </div>
    </main>
  );
}
