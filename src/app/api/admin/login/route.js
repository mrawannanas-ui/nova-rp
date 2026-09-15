import { createAdminSession, adminCookieName } from "@/lib/auth";

const attempts = new Map();

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const recent = attempts.get(ip) || { count: 0, startedAt: now };
  if (now - recent.startedAt > 15 * 60 * 1000) {
    attempts.set(ip, { count: 0, startedAt: now });
  } else if (recent.count >= 10) {
    return Response.json({ error: "محاولات كثيرة. حاول بعد قليل." }, { status: 429 });
  }

  const { username, password } = await request.json();
  const valid = username === (process.env.ADMIN_USERNAME || "admin") && password === process.env.ADMIN_PASSWORD;
  if (!valid) {
    attempts.set(ip, { count: recent.count + 1, startedAt: recent.startedAt });
    return Response.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }

  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", `${adminCookieName}=${createAdminSession()}; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
  attempts.delete(ip);
  return response;
}