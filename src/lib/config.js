/**
 * Public NOVA RP identifiers.
 *
 * Everything in here is already visible to anyone who uses the site — the
 * client id and redirect uri appear in the Discord authorize URL, the invite
 * is public, and guild/role ids are visible to every server member. Baking
 * them in means only real secrets need to live in the environment.
 *
 * An env var always wins, so you can point a staging deploy at another server
 * without touching this file.
 *
 * NEVER add the client secret, bot token or webhook URL here — this file is
 * committed to a public repository.
 */
export const discordConfig = {
  clientId: process.env.DISCORD_CLIENT_ID || "1355294076303315055",
  guildId: process.env.DISCORD_GUILD_ID || "1536260589788069928",
  verifiedRoleId: process.env.DISCORD_VERIFIED_ROLE_ID || "1536298785570033750",
  redirectUri: process.env.DISCORD_REDIRECT_URI || "https://nova-rp.vercel.app/api/verify/callback",
  invite: process.env.NEXT_PUBLIC_DISCORD_INVITE || "https://discord.gg/CFR9MBDqeY",
};

export const verifyConfig = {
  minAccountAgeDays: Number(process.env.VERIFY_MIN_ACCOUNT_AGE_DAYS ?? 7),
  blockedIds: (process.env.VERIFY_BLOCKED_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};

/** Secrets that must come from the environment. Used to report setup state. */
export function missingSecrets() {
  const required = {
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    VERIFY_SESSION_SECRET: process.env.VERIFY_SESSION_SECRET,
  };
  return Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);
}
