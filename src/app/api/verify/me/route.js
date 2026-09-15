import { readVerifySession, verifyCookieName } from "@/lib/discord";

export const dynamic = "force-dynamic";

export async function GET(request) {
  // Site key is read at runtime so it works without a rebuild after an env change.
  const captchaSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.TURNSTILE_SITE_KEY || null;
  const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE || null;

  const session = readVerifySession(request.cookies.get(verifyCookieName)?.value);

  return Response.json({
    captchaSiteKey,
    discordInvite,
    user: session
      ? { id: session.id, username: session.username, tag: session.tag, avatar: session.avatar }
      : null,
  });
}
