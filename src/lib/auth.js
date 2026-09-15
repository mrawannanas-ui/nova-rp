import crypto from "crypto";

export const adminCookieName = "nova_admin_session";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "change-this-admin-session-secret";
}

export function createAdminSession() {
  const payload = Buffer.from(JSON.stringify({
    role: "admin",
    expiresAt: Date.now() + 1000 * 60 * 60 * 12,
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function isValidAdminSession(value) {
  if (!value || !value.includes(".")) return false;
  const [payload, signature] = value.split(".");
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.role === "admin" && data.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function isAdminRequest(request) {
  return isValidAdminSession(request.cookies.get(adminCookieName)?.value);
}