"use client";

import { useEffect, useState } from "react";
import { products as fallbackProducts } from "@/lib/data";

const emptyForm = { name: "", price: "", category: "رتب VIP", description: "", icon: "🛒", image: "" };

export default function AdminPage() {
  const [products, setProducts] = useState(fallbackProducts);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/products").then((response) => response.json()).then(setProducts).catch(() => {});
  }, []);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function addProduct(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      let image = form.image;
      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadResponse = await fetch("/api/upload", { method: "POST", body: uploadData });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadResult.error);
        image = uploadResult.url;
      }
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image, price: Number(form.price) }),
      });
      if (!response.ok) throw new Error("تعذر حفظ المنتج");
      const product = await response.json();
      setProducts((current) => [...current, product]);
      setForm(emptyForm);
      setFile(null);
      event.target.reset();
      setMessage("تمت إضافة المنتج بنجاح");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(id) {
    if (!window.confirm("هل تريد حذف هذا المنتج؟")) return;
    await fetch("/api/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setProducts((current) => current.filter((product) => product.id !== id));
    setMessage("تم حذف المنتج");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <main className="section" style={{ paddingTop: "calc(var(--nav-h) + 50px)" }}>
      <div className="container admin-shell">
        <div className="page-head" style={{ padding: 0, textAlign: "right" }}>
          <span className="eyebrow">NOVA CONTROL</span>
          <h1 className="section-title"><span>إدارة</span> المتجر</h1>
          <p className="section-sub">أضف منتجات جديدة مع صورة، وسيتم نشرها مباشرة في المتجر.</p>
          <div className="mt" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a className="btn btn-ghost btn-sm" href="/admin/verifications">سجل التفعيلات</a>
            <button className="btn btn-ghost btn-sm" onClick={logout}>تسجيل الخروج</button>
          </div>
        </div>

        <section className="card mt">
          {message && <div className="admin-message">{message}</div>}
          <form className="admin-form" onSubmit={addProduct}>
            <label className="field">اسم المنتج<input name="name" value={form.name} onChange={updateField} required /></label>
            <label className="field">السعر بالدولار<input name="price" type="number" min="0" value={form.price} onChange={updateField} required /></label>
            <label className="field">التصنيف<input name="category" value={form.category} onChange={updateField} required /></label>
            <label className="field">الأيقونة الاحتياطية<input name="icon" value={form.icon} onChange={updateField} /></label>
            <label className="field full">الوصف<textarea name="description" value={form.description} onChange={updateField} required /></label>
            <label className="field full">صورة المنتج
              <span className="upload-box">
                <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files[0] || null)} />
                {file && <span>{file.name}</span>}
              </span>
            </label>
            <label className="field full">أو رابط صورة<input name="image" value={form.image} onChange={updateField} placeholder="https://..." /></label>
            <button className="btn btn-primary full" disabled={saving}>{saving ? "جارٍ الحفظ..." : "إضافة المنتج"}</button>
          </form>
        </section>

        <section className="section" style={{ padding: "34px 0 0" }}>
          <h2 className="section-title"><span>المنتجات</span> الحالية</h2>
          <div className="admin-list">
            {products.map((product) => (
              <div className="admin-item" key={product.id}>
                <div className="admin-item-main">
                  {product.image ? <img src={product.image} alt="" /> : <span className="ico">{product.icon || "🛒"}</span>}
                  <div><strong>{product.name}</strong><p>{product.category} · ${product.price}</p></div>
                </div>
                <div className="admin-item-actions"><button className="btn btn-danger btn-sm" onClick={() => removeProduct(product.id)}>حذف</button></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
