import Link from "next/link";
import { rules } from "@/lib/data";

export const metadata = { title: "NOVA RP — القوانين" };

export default function RulesPage() {
  return (
    <>
      <header className="page-head">
        <div className="container">
          <span className="eyebrow">اقرأ بعناية</span>
          <h1 className="section-title"><span>قوانين</span> السيرفر</h1>
          <p className="section-sub center" style={{ margin: "12px auto 0" }}>
            دخولك السيرفر يعني موافقتك على كل القوانين التالية. الجهل بالقانون لا يُعفي من العقوبة.
          </p>
        </div>
      </header>

      <main className="section" style={{ paddingTop: 20 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          {rules.map((group, i) => (
            <div className="rule-group" key={i}>
              <h3><span className="num">{i + 1}</span> {group.title}</h3>
              <ul className="rule-list">
                {group.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="card center" style={{ marginTop: 30 }}>
            <p style={{ color: "var(--muted)" }}>فهمت القوانين ومستعد تبدأ؟</p>
            <Link className="btn btn-primary mt" href="/store">تصفّح المتجر ←</Link>
          </div>
        </div>
      </main>
    </>
  );
}
