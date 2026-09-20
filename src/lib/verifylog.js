import fs from "fs";
import path from "path";
import { verifyConfig } from "@/lib/config";

const LOG_PATH = path.join(process.cwd(), "src", "data", "verifications.json");
const MAX_RECORDS = 1000;

function read() {
  try {
    const raw = fs.readFileSync(LOG_PATH, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function write(records) {
  try {
    fs.writeFileSync(LOG_PATH, JSON.stringify(records.slice(-MAX_RECORDS), null, 2));
    return true;
  } catch {
    // Read-only filesystem (some hosts) — the webhook audit log is the fallback.
    return false;
  }
}

export function listVerifications() {
  return read().slice().reverse();
}

export function findVerification(userId) {
  return read().find((r) => r.userId === userId && r.status === "success") || null;
}

export function recordVerification(entry) {
  const records = read();
  records.push({ ...entry, at: new Date().toISOString() });
  write(records);
}

/** User IDs that may never verify. Comma-separated env var. */
export function isBlocked(userId) {
  return verifyConfig.blockedIds.includes(String(userId));
}

/** Fire-and-forget audit embed to a Discord webhook. */
export async function auditLog({ ok, user, ip, reason, ageDays }) {
  const url = process.env.DISCORD_LOG_WEBHOOK;
  if (!url) return;

  const maskedIp = String(ip || "unknown").replace(/\.\d+$/, ".xxx");

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: ok ? "✅ تفعيل ناجح" : "⛔ محاولة تفعيل مرفوضة",
            color: ok ? 0x31d07a : 0xff5a6a,
            fields: [
              { name: "العضو", value: `<@${user.id}> (\`${user.tag}\`)`, inline: false },
              { name: "ID", value: `\`${user.id}\``, inline: true },
              ...(ageDays != null ? [{ name: "عمر الحساب", value: `${ageDays} يوم`, inline: true }] : []),
              { name: "IP", value: `\`${maskedIp}\``, inline: true },
              ...(reason ? [{ name: "السبب", value: reason, inline: false }] : []),
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "NOVA RP — نظام التحقق" },
          },
        ],
      }),
    });
  } catch {
    // Never let logging break verification.
  }
}
