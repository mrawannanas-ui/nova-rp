"use client";
import { useEffect, useMemo, useState } from "react";
import {
  products as staticProducts,
  settings as staticSettings,
  getProducts,
  getSettings,
  whatsappLink,
  money,
} from "@/lib/data";

export default function StorePage() {
  const [products, setProducts] = useState(staticProducts);
  const [settings, setSettings] = useState(staticSettings);
  const [activeCat, setActiveCat] = useState("الكل");
  const [query, setQuery] = useState("");

  // overlay any admin edits stored in the browser
  useEffect(() => {
    setProducts(getProducts());
    setSettings(getSettings());
  }, []);

  const categories = useMemo(
    () => ["الكل", ...new Set(products.map((p) => p.category || "أخرى"))],
    [products]
  );

  const list = useMemo(() => {
    let l = products.slice();
    if (activeCat !== "الكل") l = l.filter((p) => (p.category || "أخرى") === activeCat);
    const q = query.trim().toLowerCase();
    if (q)
      l = l.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    return l;
  }, [products, activeCat, query]);

  const buy = () =>
    window.open(whatsappLink(settings.whatsappNumber, settings.whatsappMessage), "_blank");

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

          {list.length === 0 ? (
            <div className="empty"><div className="big">📦</div><p>لا توجد منتجات مطابقة.</p></div>
          ) : (
            <div className="grid grid-3">
              {list.map((p) => (
                <div className="card product" key={p.id}>
                  <div className="thumb">{p.icon || "🛒"}</div>
                  <span className="cat">{p.category || "أخرى"}</span>
                  <h3>{p.name}</h3>
                  <p className="desc">{p.description || ""}</p>
                  <div className="foot">
                    <span className="price">${money(p.price)} <small>USD</small></span>
                    <button className="btn btn-primary btn-sm" onClick={buy}>شراء</button>
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
