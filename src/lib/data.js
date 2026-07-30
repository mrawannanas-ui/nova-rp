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

// localStorage helpers for the client-side admin editor
const LS_PRODUCTS = "nova_products";
const LS_CODES = "nova_codes";
const LS_SETTINGS = "nova_settings";

export function getProducts() {
  if (typeof window === "undefined") return products;
  try {
    const saved = localStorage.getItem(LS_PRODUCTS);
    return saved ? JSON.parse(saved) : products;
  } catch {
    return products;
  }
}
export function saveProducts(list) {
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(list));
}

export function getCodes() {
  if (typeof window === "undefined") return codes;
  try {
    const saved = localStorage.getItem(LS_CODES);
    return saved ? JSON.parse(saved) : codes;
  } catch {
    return codes;
  }
}
export function saveCodes(list) {
  localStorage.setItem(LS_CODES, JSON.stringify(list));
}

export function getSettings() {
  if (typeof window === "undefined") return settings;
  try {
    const saved = localStorage.getItem(LS_SETTINGS);
    return saved ? { ...settings, ...JSON.parse(saved) } : settings;
  } catch {
    return settings;
  }
}
export function saveSettings(obj) {
  localStorage.setItem(LS_SETTINGS, JSON.stringify(obj));
}
