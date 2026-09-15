"use client";

import { useEffect, useMemo, useState } from "react";

const FILTERS = [
  { key: "all", label: "الكل" },
  { key: "success", label: "ناجح" },
  { key: "denied", label: "مرفوض" },
];

const REASONS = {
  replay: "إعادة استخدام جلسة",
  rate_limit_user: "تجاوز عدد المحاولات",
  blocked: "حساب محظور",
  captcha_missing: "لم يكمل الكابتشا",
  captcha_failed: "فشل الكابتشا",
  captcha_unreachable: "الكابتشا غير متاحة",
  account_too_new: "حساب جديد جداً",
  role_failed: "فشل إعطاء الرتبة",
  join_failed: "فشل الانضمام للسيرفر",
  member_lookup_failed: "غير موجود بالسيرفر",
  missing_config: "إعدادات ناقصة",
  rules_not_accepted: "لم يوافق على القوانين",
};

export default function AdminPage() {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/verify/log")
      .then((r) => r.json())
      .then((data) => setRecords(data.records || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      return [r.tag, r.username, r.userId].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [records, filter, query]);

  const stats = useMemo(
    () => ({
      total: records.length,
      success: records.filter((r) => r.status === "success").length,
      denied: records.filter((r) => r.status === "denied").length,
      unique: new Set(records.filter((r) => r.status === "success").map((r) => r.userId)).size,
    }),
    [records],
  );

  return (
    <main className="section" style={{ paddingTop: "calc(var(--nav-h) + 50px)" }}>
      <div className="container admin-shell">
        <div className="page-head" style={{ padding: 0, textAlign: "right" }}>
          <span className="eyebrow">NOVA CONTROL</span>
          <h1 className="section-title">
            <span>سجل</span> التفعيلات
          </h1>
          <p className="section-sub">كل محاولات التفعيل الناجحة والمرفوضة مع سببها.</p>
          <button className="btn btn-ghost btn-sm mt" onClick={logout}>
            تسجيل الخروج
          </button>
        </div>

        <div className="vf-stats mt">
          <div className="vf-stat">
            <b>{stats.unique}</b>
            <small>لاعب مُفعّل</small>
          </div>
          <div className="vf-stat">
            <b>{stats.success}</b>
            <small>عملية ناجحة</small>
          </div>
          <div className="vf-stat">
            <b className="bad">{stats.denied}</b>
            <small>محاولة مرفوضة</small>
          </div>
          <div className="vf-stat">
            <b>{stats.total}</b>
            <small>إجمالي السجلات</small>
          </div>
        </div>

        <div className="store-toolbar mt">
          <div className="filters">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={"chip" + (filter === f.key ? " active" : "")}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="search">
            <input placeholder="بحث بالاسم أو الـ ID…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {loading && <p className="vf-loading">جاري التحميل…</p>}

        {!loading && !shown.length && (
          <div className="empty">
            <div className="big">📋</div>
            لا توجد سجلات بعد.
          </div>
        )}

        <div className="admin-list">
          {shown.map((r, i) => (
            <div className="admin-item" key={`${r.userId}-${r.at}-${i}`}>
              <div className="admin-item-main">
                <span className={"vf-dot " + (r.status === "success" ? "ok" : "bad")} />
                <div>
                  <strong>{r.username || r.tag}</strong>
                  <p>
                    <code>{r.userId}</code> · {new Date(r.at).toLocaleString("ar-EG")}
                    {r.ip ? ` · ${r.ip}` : ""}
                  </p>
                </div>
              </div>
              <div className="admin-item-actions">
                {r.status === "success" ? (
                  <span className="vf-badge ok">{r.reverify ? "إعادة تفعيل" : "مُفعّل"}</span>
                ) : (
                  <span className="vf-badge bad">{REASONS[r.reason] || r.reason || "مرفوض"}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
