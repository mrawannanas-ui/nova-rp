// Static data access + helpers (frontend only)
import products from "@/data/products.json";
import rules from "@/data/rules.json";
import codes from "@/data/codes.json";
import settings from "@/data/settings.json";

export { products, rules, codes, settings };

// Build a wa.me link; normalize Egyptian local (01…) to intl (201…)
export function whatsappLink(number, message) {
  let num = String(number || "").replace(/\D/g, "");
  if (num.startsWith("00")) num = num.slice(2);
  else if (num.startsWith("0")) num = "20" + num.slice(1);
  const text = encodeURIComponent(message || "");
  return "https://wa.me/" + num + (text ? "?text=" + text : "");
}

export function money(n) {
  return Number(n || 0).toLocaleString("en-US");
}
