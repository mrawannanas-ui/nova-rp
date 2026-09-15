import {
  consumeOnce,
  cookieOptions,
  grantVerifiedRole,
  readVerifySession,
  verifyCookieName,
} from "@/lib/discord";
import { checkAccountAge, clientIp, rateLimit, verifyTurnstile } from "@/lib/security";
import { auditLog, findVerification, isBlocked, recordVerification } from "@/lib/verifylog";
import { rulesVersion } from "@/lib/rules";

export const dynamic = "force-dynamic";

const MESSAGES = {
  missing_config: "نظام التفعيل غير مُعد بالكامل. تواصل مع الإدارة.",
  join_failed: "تعذّر إضافتك للسيرفر. تأكد أنك منضم لسيرفر نوفا وحاول مرة أخرى.",
  member_lookup_failed: "لم نتمكن من إيجادك داخل السيرفر. انضم للسيرفر أولاً ثم أعد المحاولة.",
  role_failed: "تعذّر إعطاؤك الرتبة. تأكد أن رتبة البوت أعلى من رتبة التفعيل.",
  captcha_missing: "أكمل التحقق الأمني أولاً.",
  captcha_failed: "فشل التحقق الأمني. حدّث الصفحة وحاول مرة أخرى.",
  captcha_unreachable: "تعذّر الوصول لخدمة التحقق الأمني. حاول بعد قليل.",
  rules_not_accepted: "لم يوافق على القوانين",
};

function deny({ status, message, user, ip, reason, ageDays }) {
  if (user) {
    recordVerification({ userId: user.id, tag: user.tag, ip, status: "denied", reason });
    auditLog({ ok: false, user, ip, reason, ageDays });
  }
  return Response.json({ error: message }, { status });
}

export async function POST(request) {
  const ip = clientIp(request);

  // Layer 1 — per-IP throttle.
  const ipLimit = rateLimit(`complete:ip:${ip}`, { limit: 8, windowMs: 10 * 60 * 1000 });
  if (!ipLimit.allowed) {
    return Response.json(
      { error: `محاولات كثيرة. حاول بعد ${ipLimit.retryAfter} ثانية.` },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } },
    );
  }

  // Layer 2 — valid, unexpired, correctly-signed session.
  const session = readVerifySession(request.cookies.get(verifyCookieName)?.value);
  if (!session) {
    return Response.json({ error: "انتهت الجلسة. سجّل دخولك بالديسكورد مرة أخرى." }, { status: 401 });
  }

  const user = { id: session.id, tag: session.tag, username: session.username, avatar: session.avatar };

  // Layer 3 — single-use session (replay protection).
  if (!consumeOnce(session.jti)) {
    return deny({ status: 409, message: "تم استخدام هذه الجلسة بالفعل. حدّث الصفحة.", user, ip, reason: "replay" });
  }

  // Layer 4 — per-user throttle.
  const userLimit = rateLimit(`complete:user:${session.id}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!userLimit.allowed) {
    return deny({ status: 429, message: "محاولات كثيرة على هذا الحساب. حاول لاحقاً.", user, ip, reason: "rate_limit_user" });
  }

  // Layer 5 — blocklist.
  if (isBlocked(session.id)) {
    return deny({ status: 403, message: "هذا الحساب محظور من التفعيل. تواصل مع الإدارة.", user, ip, reason: "blocked" });
  }

  // Layer 6 — CAPTCHA.
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const captcha = await verifyTurnstile({ token: body.captchaToken, ip });
  if (!captcha.ok) {
    return deny({ status: 400, message: MESSAGES[captcha.reason], user, ip, reason: captcha.reason });
  }

  // Layer 6b — the player must have accepted the rules.
  if (body.acceptedRules !== true) {
    return deny({ status: 400, message: "يجب الموافقة على قوانين السيرفر أولاً.", user, ip, reason: "rules_not_accepted" });
  }

  // Layer 7 — minimum Discord account age (anti-alt).
  const age = checkAccountAge(session.id);
  if (!age.ok) {
    return deny({
      status: 403,
      message: `حسابك في ديسكورد عمره ${age.ageDays} يوم فقط. الحد الأدنى للتفعيل ${age.minDays} يوم.`,
      user,
      ip,
      reason: "account_too_new",
      ageDays: age.ageDays,
    });
  }

  const alreadyVerified = Boolean(findVerification(session.id));

  // Layer 8 — grant the role via the bot.
  const result = await grantVerifiedRole({ userId: session.id, accessToken: session.accessToken });

  if (!result.ok) {
    return deny({
      status: 400,
      message: MESSAGES[result.reason] || "حدث خطأ غير متوقع. تواصل مع الإدارة.",
      user,
      ip,
      reason: result.reason,
      ageDays: age.ageDays,
    });
  }

  recordVerification({
    userId: session.id,
    tag: session.tag,
    username: session.username,
    ip,
    status: "success",
    joined: Boolean(result.joined),
    reverify: alreadyVerified,
    ageDays: age.ageDays,
    rulesVersion,
  });
  auditLog({ ok: true, user, ip, ageDays: age.ageDays, reason: alreadyVerified ? "إعادة تفعيل" : null });

  const response = Response.json({
    ok: true,
    joined: result.joined,
    reverify: alreadyVerified,
    user: { username: session.username, tag: session.tag, avatar: session.avatar },
  });
  response.headers.append("Set-Cookie", `${verifyCookieName}=; ${cookieOptions(0)}`);
  return response;
}
