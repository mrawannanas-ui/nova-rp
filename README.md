# NOVA RP — Next.js (static, deploy to Vercel)

موقع **NOVA RP** بعد تحويله إلى **Next.js (App Router)** — فرونت إند بالكامل، والبيانات **ثابتة في ملفات JSON**. جاهز للنشر على **Vercel** أو أي استضافة ثابتة.

## البنية
```
src/
  app/            الصفحات (App Router)
    page.js         الرئيسية
    rules/          القوانين
    store/          المتجر (زر الشراء يفتح واتساب)
    layout.js       التخطيط + الخطوط + Navbar/Footer/Fab
    globals.css     التصميم
  components/      Navbar / Footer / Fab
  data/           ← البيانات الثابتة (عدّلها هنا)
    products.json   المنتجات
    rules.json      القوانين
    settings.json   الإعدادات (رقم/رسالة واتساب، دعوة ديسكورد)
  lib/data.js     قراءة البيانات + دوال مساعدة
public/logo.svg   اللوجو
```

## تعديل المحتوى
كل البيانات في `src/data/*.json` — عدّلها مباشرة وارفع التغيير (git push) فيعيد Vercel النشر تلقائيًا.

> ملاحظة أمان: بما أن الموقع static، فأي شيء في ملفات JSON مرئي في كود الصفحة — لا تضع فيها أسرارًا.

## التشغيل محليًا (يتطلب Node.js)
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # ينتج مجلد /out ثابت
```

## النشر على Vercel
1. أنشئ مستودعًا على GitHub وارفع المشروع (انظر الأوامر بالأسفل).
2. ادخل https://vercel.com ← New Project ← اختر المستودع.
3. Vercel يكتشف Next.js تلقائيًا — اضغط **Deploy**. خلاص.

### رفع المشروع على GitHub
```bash
# أنشئ Repo فاضي على github.com باسم nova-rp، ثم:
git remote add origin https://github.com/<username>/nova-rp.git
git push -u origin main
```

## المميزات
- تصميم داكن (كروم + أزرق) متجاوب RTL، خطوط Tajawal + Orbitron.
- زر الشراء يفتح **واتساب** مباشرة برسالة جاهزة (الرقم في `settings.json`).
- زر متجر عائم في كل الصفحات.
