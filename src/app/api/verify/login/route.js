import crypto from "crypto";
import { NextResponse } from "next/server";
import { authorizeUrl, cookieOptions, redirectUri, stateCookieName } from "@/lib/discord";
import { clientIp, rateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request) {
  // Only the secret can be missing now — the client id is baked into config.
  if (!process.env.DISCORD_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/verify?error=config", request.url));
  }

  const limit = rateLimit(`login:${clientIp(request)}`, { limit: 15, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.redirect(new URL("/verify?error=ratelimit", request.url));
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirect = redirectUri(request);

  const response = NextResponse.redirect(authorizeUrl({ state, redirect }));
  response.headers.append("Set-Cookie", `${stateCookieName}=${state}; ${cookieOptions(600)}`);
  return response;
}
