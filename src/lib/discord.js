import crypto from "crypto";

export const verifyCookieName = "nova_verify_session";
export const stateCookieName = "nova_verify_state";

const DISCORD_API = "https://discord.com/api/v10";

function secret() {
  return process.env.VERIFY_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "change-this-verify-secret";
}

function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createVerifySession(data) {
  const payload = Buffer.from(JSON.stringify({
    ...data,
    jti: crypto.randomBytes(12).toString("hex"),
    expiresAt: Date.now() + 1000 * 60 * 15,
  })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/**
 * Replay protection: a signed session may only be redeemed once, even if the
 * attacker captured the cookie before it was cleared.
 */
const usedTokens = new Map();

export function consumeOnce(jti) {
  const now = Date.now();
  for (const [k, exp] of usedTokens) if (exp < now) usedTokens.delete(k);
  if (!jti) return true;
  if (usedTokens.has(jti)) return false;
  usedTokens.set(jti, now + 1000 * 60 * 20);
  return true;
}

export function readVerifySession(value) {
  if (!value || !value.includes(".")) return null;
  const [payload, signature] = value.split(".");
  const expected = sign(payload);
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.expiresAt > Date.now() ? data : null;
  } catch {
    return null;
  }
}

export function cookieOptions(maxAge) {
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function redirectUri(request) {
  if (process.env.DISCORD_REDIRECT_URI) return process.env.DISCORD_REDIRECT_URI;
  const url = new URL("/api/verify/callback", request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    url.host = forwardedHost;
    url.protocol = `${forwardedProto || "https"}:`;
  }
  return url.toString();
}

export function authorizeUrl({ state, redirect }) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID || "",
    redirect_uri: redirect,
    response_type: "code",
    scope: "identify guilds.join",
    state,
    prompt: "consent",
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

export async function exchangeCode({ code, redirect }) {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID || "",
      client_secret: process.env.DISCORD_CLIENT_SECRET || "",
      grant_type: "authorization_code",
      code,
      redirect_uri: redirect,
    }),
  });
  if (!res.ok) throw new Error(`token_exchange_failed:${res.status}`);
  return res.json();
}

export async function fetchDiscordUser(accessToken) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`user_fetch_failed:${res.status}`);
  return res.json();
}

/** Adds the member to the guild if missing, then assigns the verified role. */
export async function grantVerifiedRole({ userId, accessToken }) {
  const guildId = process.env.DISCORD_GUILD_ID;
  const roleId = process.env.DISCORD_VERIFIED_ROLE_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!guildId || !roleId || !botToken) {
    return { ok: false, reason: "missing_config" };
  }

  const auth = { Authorization: `Bot ${botToken}` };

  const member = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${userId}`, { headers: auth });

  if (member.status === 404) {
    const join = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${userId}`, {
      method: "PUT",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: accessToken, roles: [roleId] }),
    });
    if (join.ok || join.status === 204) return { ok: true, joined: true };
    return { ok: false, reason: "join_failed", status: join.status, detail: await join.text() };
  }

  if (!member.ok) {
    return { ok: false, reason: "member_lookup_failed", status: member.status };
  }

  const addRole = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: "PUT",
    headers: auth,
  });
  if (addRole.ok || addRole.status === 204) return { ok: true, joined: false };
  return { ok: false, reason: "role_failed", status: addRole.status, detail: await addRole.text() };
}
