"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json();
    if (!response.ok) setError(result.error || "تعذر تسجيل الدخول");
    else router.replace("/admin");
    setLoading(false);
  }

  return (
    <main className="section auth-page">
      <div className="card auth-card">
        <img className="auth-logo" src="/NOVA-LOGO.png" alt="NOVA Country" />
        <span className="eyebrow">NOVA COUNTRY ADMIN PANEL</span>
        <h1 className="section-title"><span>تسجيل</span> الدخول</h1>
        <p className="section-sub">لوحة الإدارة محمية ومخصصة لفريق NOVA فقط.</p>
        <form className="admin-form auth-form" onSubmit={submit}>
          <label className="field full">اسم المستخدم<input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} autoComplete="username" required /></label>
          <label className="field full">كلمة المرور<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="current-password" required /></label>
          {error && <p className="admin-message auth-error">{error}</p>}
          <button className="btn btn-primary full" disabled={loading}>{loading ? "جارٍ التحقق..." : "دخول آمن"}</button>
        </form>
      </div>
    </main>
  );
}