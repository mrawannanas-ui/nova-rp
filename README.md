# NOVA RP — Next.js (static, deploy to Vercel)

موقع **NOVA RP** بعد تحويله إلى **Next.js (App Router)** — فرونت إند بالكامل، والبيانات **ثابتة في ملفات JSON**. جاهز للنشر على **Vercel** أو أي استضافة ثابتة.

## البنية
```
src/
  app/            الصفحات (App Router)
    page.js         الرئيسية
    rules/          القوانين
    activation/     التفعيل
    store/          المتجر (زر الشراء يفتح واتساب)
    admin/          لوحة تحرير محلية (localStorage + تصدير JSON)
    layout.js       التخطيط + الخطوط + Navbar/Footer/Fab
    globals.css     التصميم
  components/      Navbar / Footer / Fab
  data/           ← البيانات الثابتة (عدّلها هنا)
    products.json   المنتجات
    rules.json      القوانين
    codes.json      أكواد التفعيل
    settings.json   الإعدادات (رقم/رسالة واتساب، دعوة ديسكورد، كلمة مرور اللوحة)
  lib/data.js     قراءة البيانات + دوال مساعدة
public/logo.svg   اللوجو
```

## تعديل المحتوى
كل البيانات في `src/data/*.json` — عدّلها مباشرة وارفع التغيير (git push) فيعيد Vercel النشر تلقائيًا.
لوحة `/admin` أداة تحرير **محلية** (تُحفظ في متصفحك فقط) وفيها زر **تصدير** لتنزيل ملف JSON المحدّث تضعه مكان القديم في `src/data` ثم ترفعه.

> ملاحظة أمان: بما أن الموقع static، فأي شيء في JSON (بما فيه `adminPassword`) مرئي في الكود — اللوحة للتنظيم فقط وليست حماية حقيقية.

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
- تفعيل يتحقق من الكود من `codes.json` في المتصفح.
- زر متجر عائم في كل الصفحات.
