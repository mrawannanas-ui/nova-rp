import Link from "next/link";
import { settings } from "@/lib/data";

export default function Home() {
  return (
    <>
      <header className="hero">
        <div className="container">
          <img className="hero-logo" src="/logo.svg" alt="NOVA RP" />
          <div className="tag">R O L E P L A Y</div>
          <h1>NOVA RP</h1>
          <p className="lead">{settings.heroSubtitle}</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/activation">🚀 فعّل حسابك الآن</Link>
            <Link className="btn btn-ghost" href="/store">🛒 تصفّح المتجر</Link>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="center mb">
            <span className="eyebrow">كل الصفحات</span>
            <h2 className="section-title"><span>استكشف</span> الموقع</h2>
            <p className="section-sub">كل أقسام NOVA RP في مكان واحد — مربوطة ببعضها عبر شريط التنقّل بالأعلى.</p>
          </div>
          <div className="grid grid-3">
            <Link className="card" href="/rules">
              <div className="ico">📜</div>
              <h3>القوانين</h3>
              <p>كل قوانين السيرفر — العامة، الروليبلاي، الوظائف والعصابات. اقرأها قبل ما تبدأ.</p>
              <span className="card-link">اذهب للقوانين ←</span>
            </Link>
            <Link className="card" href="/activation">
              <div className="ico">✅</div>
              <h3>التفعيل الإلكتروني</h3>
              <p>سجّل بياناتك وكود التفعيل، والنظام يتحقق من الرقم اللي دخّلته فورًا.</p>
              <span className="card-link">فعّل حسابك ←</span>
            </Link>
            <Link className="card" href="/store">
              <div className="ico">🛒</div>
              <h3>المتجر</h3>
              <p>رتب VIP، عملات، سيارات وأكثر. تصفية حسب القسم وبحث سريع.</p>
              <span className="card-link">افتح المتجر ←</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="grid grid-4">
            <div className="card"><div className="ico">🛡️</div><h3>حماية وأنتي-تشيت</h3><p>نظام حماية متطور يضمن لعب نظيف وعادل.</p></div>
            <div className="card"><div className="ico">💼</div><h3>وظائف واقعية</h3><p>شرطة، إسعاف، ميكانيكي، تاجر سيارات والمزيد.</p></div>
            <div className="card"><div className="ico">📱</div><h3>هاتف متكامل</h3><p>تطبيقات، رسائل، سوشيال ميديا وبنك داخل اللعبة.</p></div>
            <div className="card"><div className="ico">🎮</div><h3>دعم مستمر</h3><p>فريق إداري نشط وتحديثات دورية للمحتوى.</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card center" style={{ padding: "48px 24px" }}>
            <h2 className="section-title"><span>جاهز تبدأ؟</span></h2>
            <p className="section-sub" style={{ margin: "12px auto 24px" }}>فعّل حسابك في أقل من دقيقة وانضم لمجتمع نوفا.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/activation">ابدأ التفعيل</Link>
              <Link className="btn btn-ghost" href="/rules">اقرأ القوانين أولًا</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
