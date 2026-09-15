import crypto from "crypto";
import rules from "@/data/rules.json";

/**
 * Short hash of the rules file. Stored with every verification so you can tell
 * which version of the rules a player actually agreed to.
 */
export const rulesVersion = crypto
  .createHash("sha256")
  .update(JSON.stringify(rules))
  .digest("hex")
  .slice(0, 8);
