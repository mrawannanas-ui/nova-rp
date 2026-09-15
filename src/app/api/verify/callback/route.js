import { NextResponse } from "next/server";
import {
  cookieOptions,
  createVerifySession,
  exchangeCode,
  fetchDiscordUser,
  redirectUri,
  stateCookieName,
  verifyCookieName,
} from "@/lib/discord";

export const dynamic = "force-dynamic";

function fail(request, code) {
  return NextResponse.redirect(new URL(`/verify?error=${code}`, request.url));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("error")) return fail(request, "denied");

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = request.cookies.get(stateCookieName)?.value;

  if (!code) return fail(request, "nocode");
  if (!state || !savedState || state !== savedState) return fail(request, "state");

  try {
    const token = await exchangeCode({ code, redirect: redirectUri(request) });
    const user = await fetchDiscordUser(token.access_token);

    const session = createVerifySession({
      id: user.id,
      username: user.global_name || user.username,
      tag: user.username,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
        : `https://cdn.discordapp.com/embed/avatars/${(Number(user.discriminator) || 0) % 5}.png`,
      accessToken: token.access_token,
    });

    const response = NextResponse.redirect(new URL("/verify?step=2", request.url));
    response.headers.append("Set-Cookie", `${verifyCookieName}=${session}; ${cookieOptions(900)}`);
    response.headers.append("Set-Cookie", `${stateCookieName}=; ${cookieOptions(0)}`);
    return response;
  } catch {
    return fail(request, "oauth");
  }
}
