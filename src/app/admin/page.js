"use client";
import { useEffect, useState } from "react";
import {
  products as staticProducts,
  codes as staticCodes,
  settings as staticSettings,
  getProducts, saveProducts,
  getCodes, saveCodes,
  getSettings, saveSettings,
} from "@/lib/data";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState("products");

  const [products, setProducts] = useState(staticProducts);
  const [codesList, setCodesList] = useState(staticCodes);
  const [settings, setSettings] = useState(staticSettings);

  useEffect(() => {
    setProducts(getProducts());
    setCodesList(getCodes());
    setSettings(getSettings());
    if (typeof window !== "undefined" && sessionStorage.getItem("nova_admin") === "1")
      setAuthed(true);
  }, []);

  const login = (e) => {
    e.preventDefault();
    if (pw === (getSettings().adminPassword || staticSettings.adminPassword)) {
      setAuthed(true);
      sessionStorage.setItem("nova_admin", "1");
    } else setLoginErr("كلمة المرور غير صحيحة");
  };
  const logout = () => {
    setAuthed(false);
    sessionStorage.removeItem("nova_admin");
    setPw("");
  };

  // ---- products
  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pCat, setPCat] = useState("");
  const [pIcon, setPIcon] = useState("");
  const [pDesc, setPDesc] = useState("");

  const addProduct = (e) => {
    e.preventDefault();
    if (!pName.trim()) return;
    const next = [
      ...products,
      {
        id: (products.reduce((m, p) => Math.max(m, p.id || 0), 0) || 0) + 1,
        name: pName.trim(),
        price: parseFloat(pPrice) || 0,
        category: pCat.trim() || "أخرى",
        icon: pIcon.trim() || "🛒",
        description: pDesc.trim(),
      },
    ];
    setProducts(next);
    saveProducts(next);
    setPName(""); setPPrice(""); setPCat(""); setPIcon(""); setPDesc("");
  };
  const delProduct = (id) => {
    const next = products.filter((p) => p.id !== id);
    setProducts(next);
    saveProducts(next);
  };

  // ---- codes
  const [newCode, setNewCode] = useState("");
  const addCode = () => {
    const c = newCode.trim().toUpperCase() ||
      "NOVA-" + Math.random().toString(16).slice(2, 6).toUpperCase() +
      "-" + Math.random().toString(16).slice(2, 6).toUpperCase();
    if (codesList.includes(c)) return;
    const next = [...codesList, c];
    setCodesList(next); saveCodes(next); setNewCode("");
  };
  const delCode = (c) => {
    const next = codesList.filter((x) => x !== c);
    setCodesList(next); saveCodes(next);
  };

  // ---- settings
  const updateSetting = (key, val) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
  };
  const persistSettings = () => saveSettings(settings);

  const download = (filename, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  if (!authed) {
    return (
      <section className="section" style={{ paddingTop: "calc(var(--nav-h) + 60px)" }}>
        <div className="container">
          <form className="form-card" onSubmit={login}>
            <div className="center mb">
              <img src="/logo.svg" style={{ width: 70, margin: "0 auto 14px" }} alt="" />
              <h2 className="section-title" style={{ fontSize: "1.6rem" }}><span>لوحة المالك</span></h2>
              <p className="section-sub center" style={{ margin: "8px auto 0" }}>للمالك فقط — أدخل كلمة المرور.</p>
            </div>
            {loginErr && <div className="alert alert-bad">{loginErr}</div>}
            <div className="field">
              <label>كلمة المرور</label>
              <input className="input" type="password" value={pw}
                onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
            </div>
            <button className="btn btn-primary btn-block" type="submit">دخول</button>
            <p className="hint" style={{ marginTop: 14, textAlign: "center" }}>
              ملاحظة: هذه لوحة تحرير محلية (تُحفظ في متصفحك). صدّر الملفات وارفعها للمستودع لتصبح دائمة.
            </p>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: "calc(var(--nav-h) + 40px)" }}>
      <div className="container">
        <div className="flex-between mb">
          <div>
            <span className="eyebrow">لوحة التحرير</span>
            <h1 className="section-title" style={{ fontSize: "1.8rem" }}><span>إدارة</span> NOVA RP</h1>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>تسجيل الخروج</button>
        </div>

        <div className="stats">
          <div className="stat"><div className="n">{products.length}</div><div className="l">منتج</div></div>
          <div className="stat"><div className="n">{codesList.length}</div><div className="l">كود تفعيل</div></div>
        </div>

        <div className="tabs">
          <button className={"tab" + (tab === "products" ? " active" : "")} onClick={() => setTab("products")}>🛒 المنتجات</button>
          <button className={"tab" + (tab === "codes" ? " active" : "")} onClick={() => setTab("codes")}>🔑 أكواد التفعيل</button>
          <button className={"tab" + (tab === "settings" ? " active" : "")} onClick={() => setTab("settings")}>⚙️ الإعدادات</button>
        </div>

        {tab === "products" && (
          <div className="grid grid-2">
            <form className="form-card" style={{ margin: 0, maxWidth: "none" }} onSubmit={addProduct}>
              <h3 style={{ marginBottom: 16 }}>➕ إضافة منتج</h3>
              <div className="field"><label>اسم المنتج</label>
                <input className="input" value={pName} onChange={(e) => setPName(e.target.value)} placeholder="مثال: VIP ذهبي" /></div>
              <div className="row">
                <div className="field"><label>السعر</label>
                  <input className="input" type="number" min="0" value={pPrice} onChange={(e) => setPPrice(e.target.value)} placeholder="100" /></div>
                <div className="field"><label>القسم</label>
                  <input className="input" value={pCat} onChange={(e) => setPCat(e.target.value)} placeholder="رتب VIP" /></div>
              </div>
              <div className="field"><label>أيقونة (إيموجي)</label>
                <input className="input" value={pIcon} onChange={(e) => setPIcon(e.target.value)} placeholder="🥇" maxLength={4} /></div>
              <div className="field"><label>الوصف</label>
                <textarea className="input" value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="وصف قصير..." /></div>
              <button className="btn btn-primary btn-block" type="submit">إضافة</button>
            </form>

            <div>
              <div className="flex-between mb">
                <h3>المنتجات ({products.length})</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => download("products.json", products)}>⬇ تصدير products.json</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>المنتج</th><th>القسم</th><th>السعر</th><th></th></tr></thead>
                  <tbody>
                    {products.length === 0 && <tr><td colSpan={4} className="empty">لا توجد منتجات.</td></tr>}
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.icon} {p.name}</td>
                        <td>{p.category}</td>
                        <td>${p.price}</td>
                        <td><button className="btn btn-danger btn-sm" onClick={() => delProduct(p.id)}>حذف</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "codes" && (
          <div>
            <div className="card flex-between mb">
              <div><h3>أكواد التفعيل</h3><p style={{ color: "var(--muted)", fontSize: ".9rem" }}>أضف كودًا مخصصًا أو ولّد عشوائيًا.</p></div>
              <div style={{ display: "flex", gap: 10 }}>
                <input className="input" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} placeholder="كود مخصص (اختياري)" style={{ width: 220 }} />
                <button className="btn btn-primary" onClick={addCode}>إضافة</button>
              </div>
            </div>
            <div className="flex-between mb">
              <span style={{ color: "var(--muted)" }}>{codesList.length} كود</span>
              <button className="btn btn-ghost btn-sm" onClick={() => download("codes.json", codesList)}>⬇ تصدير codes.json</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>الكود</th><th></th></tr></thead>
                <tbody>
                  {codesList.length === 0 && <tr><td colSpan={2} className="empty">لا توجد أكواد.</td></tr>}
                  {codesList.map((c) => (
                    <tr key={c}><td><code className="tag">{c}</code></td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => delCode(c)}>حذف</button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <form className="form-card" style={{ margin: 0, maxWidth: 640 }} onSubmit={(e) => { e.preventDefault(); persistSettings(); }}>
            <h3 style={{ marginBottom: 16 }}>⚙️ الإعدادات</h3>
            <div className="field"><label>رقم الواتساب</label>
              <input className="input" value={settings.whatsappNumber || ""} onChange={(e) => updateSetting("whatsappNumber", e.target.value)} placeholder="01274409802" /></div>
            <div className="field"><label>رسالة الواتساب الجاهزة</label>
              <textarea className="input" rows={5} value={settings.whatsappMessage || ""} onChange={(e) => updateSetting("whatsappMessage", e.target.value)} /></div>
            <div className="field"><label>رابط دعوة الديسكورد</label>
              <input className="input" value={settings.discordInvite || ""} onChange={(e) => updateSetting("discordInvite", e.target.value)} placeholder="https://discord.gg/xxxx" /></div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" type="submit">حفظ محليًا</button>
              <button className="btn btn-ghost" type="button" onClick={() => download("settings.json", settings)}>⬇ تصدير settings.json</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
