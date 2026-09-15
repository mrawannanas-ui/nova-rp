"use client";
import { useEffect, useMemo, useState } from "react";
import { products, settings, whatsappLink, money } from "@/lib/data";

export default function StorePage() {
  const [catalog, setCatalog] = useState(products);
  const [activeCat, setActiveCat] = useState("الكل");
  const [query, setQuery] = useState("");
  const [paying, setPaying] = useState(null);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((response) => response.ok ? response.json() : products)
      .then((data) => setCatalog(Array.isArray(data) ? data : products))
      .catch(() => setCatalog(products));
  }, []);

  const categories = useMemo(
    () => ["الكل", ...new Set(catalog.map((p) => p.category || "أخرى"))],
    [catalog]
  );

  const list = useMemo(() => {
    let l = catalog.slice();
    if (activeCat !== "الكل") l = l.filter((p) => (p.category || "أخرى") === activeCat);
    const q = query.trim().toLowerCase();
    if (q)
      l = l.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    return l;
  }, [catalog, activeCat, query]);

  const buy = async (product) => {
    setPaying(product.id);
    setPaymentError("");
    try {
      const response = await fetch("/api/paymob/payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(product) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const message = `${settings.whatsappMessage}\n\nPaymob Order ID: ${result.orderId}\nالمنتج: ${product.name}`;
      window.open(whatsappLink(settings.whatsappNumber, message), "_blank");
      setPaymentError(`تم إنشاء طلب الدفع رقم ${result.orderId}.`);
    } catch (error) {
      setPaymentError(error.message || "تعذر بدء الدفع");
      window.open(whatsappLink(settings.whatsappNumber, settings.whatsappMessage), "_blank");
    } finally {
      setPaying(null);
    }
  };

  return (
    <>
      <header className="page-head">
        <div className="container">
          <span className="eyebrow">المتجر الرسمي</span>
          <h1 className="section-title"><span>متجر</span> NOVA RP</h1>
          <p className="section-sub center" style={{ margin: "12px auto 0" }}>
            رتب VIP، عملات، سيارات وأكثر. ادعم السيرفر واحصل على مزايا حصرية.
          </p>
        </div>
      </header>

      <main className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="store-toolbar">
            <div className="filters">
              {categories.map((c) => (
                <button
                  key={c}
                  className={"chip" + (c === activeCat ? " active" : "")}
                  onClick={() => setActiveCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="search">
              <input
                placeholder="🔍 ابحث عن منتج..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          {paymentError && <div className="admin-message payment-message">{paymentError} تم فتح واتساب للتواصل مع الإدارة.</div>}

          {list.length === 0 ? (
            <div className="empty"><div className="big">📦</div><p>لا توجد منتجات مطابقة.</p></div>
          ) : (
            <div className="grid grid-3">
              {list.map((p) => (
                <div className="card product" key={p.id}>
                  <div className="thumb">
                    {p.image ? <img src={p.image} alt="" /> : (p.icon || "🛒")}
                  </div>
                  <span className="cat">{p.category || "أخرى"}</span>
                  <h3>{p.name}</h3>
                  <p className="desc">{p.description || ""}</p>
                  <div className="foot">
                    <span className="price">${money(p.price)} <small>USD</small></span>
                    <button className="btn btn-primary btn-sm" onClick={() => buy(p)} disabled={paying === p.id}>{paying === p.id ? "جارٍ التحويل..." : "شراء"}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
