"use client";
import { useState } from "react";
import { codes } from "@/lib/data";

export default function ActivationPage() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [code, setCode] = useState("");
  const [alert, setAlert] = useState(null); // {msg, ok}
  const [result, setResult] = useState(null); // {name, number, id}

  const submit = (e) => {
    e.preventDefault();
    setAlert(null);
    setResult(null);
    const nm = name.trim();
    const num = number.trim();
    const cd = code.trim().toUpperCase();

    if (nm.length < 2) return setAlert({ msg: "من فضلك اكتب اسمك بشكل صحيح.", ok: false });
    if (!/^\d{5,20}$/.test(num))
      return setAlert({ msg: "الرقم غير صالح — لازم يكون أرقام فقط (من 5 إلى 20 خانة).", ok: false });
    if (!cd) return setAlert({ msg: "من فضلك اكتب كود التفعيل.", ok: false });

    const valid = codes.map((c) => String(c).toUpperCase()).includes(cd);
    if (!valid) return setAlert({ msg: "كود التفعيل غير موجود.", ok: false });

    // client-only activation id
    const id = "NV-" + String(Math.abs(hash(nm + num + cd)) % 100000).padStart(5, "0");
    setResult({ name: nm, number: num, id });
  };

  return (
    <>
      <header className="page-head">
        <div className="container">
          <span className="eyebrow">تفعيل إلكتروني</span>
          <h1 className="section-title"><span>فعّل</span> حسابك</h1>
          <p className="section-sub center" style={{ margin: "12px auto 0" }}>
            أدخل بياناتك وكود التفعيل، والنظام هيتحقق من الرقم اللي دخّلته ويصدر لك رقم تفعيل رسمي.
          </p>
        </div>
      </header>

      <main className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <form className="form-card" onSubmit={submit} noValidate>
            {alert && (
              <div className={"alert pop " + (alert.ok ? "alert-good" : "alert-bad")}>{alert.msg}</div>
            )}

            {!result && (
              <>
                <div className="field">
                  <label>الاسم داخل اللعبة</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: Anas Nova" autoComplete="off" />
                </div>
                <div className="field">
                  <label>رقم التحقق (Discord ID / رقم الهوية)</label>
                  <input className="input" value={number} inputMode="numeric"
                    onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 20))}
                    placeholder="أرقام فقط" autoComplete="off" />
                  <div className="hint">أرقام فقط، من 5 إلى 20 خانة — سيتم التحقق منه.</div>
                </div>
                <div className="field">
                  <label>كود التفعيل</label>
                  <input className="input mono" value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="NOVA-XXXX-XXXX" style={{ letterSpacing: "2px" }} autoComplete="off" />
                  <div className="hint">تحصل على الكود من إدارة السيرفر.</div>
                </div>
                <button className="btn btn-primary btn-block" type="submit">تحقّق وفعّل</button>
              </>
            )}

            {result && (
              <div className="result pop" style={{ display: "block" }}>
                <div className="big">🎉</div>
                <h3>تم التفعيل بنجاح</h3>
                <p style={{ color: "var(--muted)" }}>أهلاً {result.name} — تم توثيق الرقم {result.number}.</p>
                <div className="idbox">رقم التفعيل: {result.id}</div>
              </div>
            )}
          </form>
        </div>
      </main>
    </>
  );
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
}
