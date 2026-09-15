# NOVA RP — Next.js

موقع **NOVA RP** باستخدام **Next.js (App Router)**، مع متجر وBackend وNova Country Admin Panel محمية.

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

## النشر على Render
يوجد ملف `render.yaml` جاهز كـ Node Web Service.

1. افتح Render واختر **New → Blueprint**.
2. اربط مستودع GitHub ثم اختر هذا المشروع.
3. أضف قيم `ADMIN_DOMAIN`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` و`PAYMOB_API_KEY` في Environment.
4. اجعل `ADMIN_DOMAIN` هو دومين لوحة الإدارة، ثم أضفه أيضًا كـ Custom Domain داخل Render.

قيمة `ADMIN_SESSION_SECRET` الموجودة في `.env.example` هي قيمة إعداد افتراضية فقط. غيّرها في Render إلى قيمة عشوائية طويلة قبل النشر العام.

> ملاحظة: تخزين المنتجات في JSON مناسب للتجربة، لكن Render لا يضمن بقاء الملفات على القرص في كل إعادة تشغيل. للإنتاج استخدم قاعدة بيانات أو قرص Render دائم.

### رفع المشروع على GitHub
```bash
# أنشئ Repo فاضي على github.com باسم nova-rp، ثم:
git remote add origin https://github.com/<username>/nova-rp.git
git push -u origin main
```

## نظام التفعيل بالديسكورد (`/verify`)

صفحة تحقق من 3 خطوات: دخول بالديسكورد → تأكيد → إعطاء رتبة التفعيل تلقائيًا فتظهر باقي الرومات للاعب.

### 1) إنشاء تطبيق ديسكورد
1. ادخل [Discord Developer Portal](https://discord.com/developers/applications) → **New Application** باسم `NOVA RP`.
2. من تبويب **OAuth2** انسخ `CLIENT ID` و`CLIENT SECRET`.
3. في **OAuth2 → Redirects** أضف:
   - `http://localhost:3000/api/verify/callback` (للتجربة المحلية)
   - `https://<دومينك>/api/verify/callback` (للنشر)
4. من تبويب **Bot** اضغط **Reset Token** وانسخ التوكن.
5. ادعُ البوت للسيرفر بصلاحية **Manage Roles** (Scopes: `bot`, Permissions: `Manage Roles`).

### 2) جلب الـ IDs من الديسكورد
فعّل **Developer Mode** من إعدادات ديسكورد (Advanced)، ثم:
- كليك يمين على السيرفر → **Copy Server ID** → `DISCORD_GUILD_ID`
- Server Settings → Roles → كليك يمين على رتبة التفعيل → **Copy Role ID** → `DISCORD_VERIFIED_ROLE_ID`

### 3) متغيرات البيئة
انسخ `.env.example` إلى `.env.local` واملأ:

| المتغير | الوصف |
|---|---|
| `DISCORD_CLIENT_ID` | Client ID من OAuth2 |
| `DISCORD_CLIENT_SECRET` | Client Secret من OAuth2 |
| `DISCORD_BOT_TOKEN` | توكن البوت |
| `DISCORD_GUILD_ID` | ID سيرفر نوفا |
| `DISCORD_VERIFIED_ROLE_ID` | ID رتبة «مُفعّل» |
| `DISCORD_REDIRECT_URI` | نفس الرابط المسجّل في Redirects بالضبط |
| `VERIFY_SESSION_SECRET` | أي نص عشوائي طويل لتوقيع الجلسة |
| `NEXT_PUBLIC_DISCORD_INVITE` | رابط دعوة السيرفر (زر الرجوع بعد التفعيل) |

### 4) إعداد السيرفر نفسه
- اسحب **رتبة البوت فوق رتبة التفعيل** في قائمة Roles، وإلا لن يستطيع إعطاءها.
- في `@everyone` أخفِ كل الرومات، وأظهرها فقط لرتبة التفعيل.
- ضع رابط `https://<دومينك>/verify` في روم الترحيب.

### خطوات التفعيل (مدموجة مع القوانين)
1. **المصادقة** — دخول بديسكورد (OAuth2).
2. **القوانين** — تُعرض قوانين السيرفر كاملة، واللاعب لازم ينزل لآخرها علشان يقدر يوافق.
3. **التحقق** — كابتشا Cloudflare Turnstile.
4. **الإكمال** — البوت يدي رتبة التفعيل تلقائياً.

### طبقات الحماية
| الطبقة | الوظيفة |
|---|---|
| Turnstile | كابتشا حقيقية يتم التحقق منها في السيرفر |
| Rate limit | ٨ محاولات/IP و٥ محاولات/حساب كل ١٠ دقايق |
| Replay protection | الجلسة تُستخدم مرة واحدة فقط (`jti`) |
| CSRF `state` | حماية مسار OAuth |
| عمر الحساب | رفض الحسابات الأحدث من `VERIFY_MIN_ACCOUNT_AGE_DAYS` |
| Blocklist | `VERIFY_BLOCKED_IDS` |
| موافقة القوانين | مفروضة في السيرفر مع تسجيل نسخة القوانين |
| جلسة موقّعة | HMAC-SHA256 + كوكي HttpOnly/SameSite/Secure |
| Security headers | CSP, HSTS, X-Frame-Options, nosniff, Permissions-Policy |
| Audit log | Embed لكل محاولة على `DISCORD_LOG_WEBHOOK` |

### إعداد الكابتشا (Cloudflare Turnstile — مجاني)
1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** → **Add Site**.
2. حط الدومين بتاعك واختر **Managed**.
3. انسخ `Site Key` → `NEXT_PUBLIC_TURNSTILE_SITE_KEY` و`Secret Key` → `TURNSTILE_SECRET_KEY`.

> لو سِبت مفاتيح Turnstile فاضية، الصفحة بترجع تلقائياً لمربع «أنا لست روبوت» العادي.

### سجل التفعيلات
متاح للإدارة على `/admin/verifications` — إحصائيات + بحث + سبب رفض كل محاولة.

> ⚠️ على Vercel وRender (الخطة المجانية) نظام الملفات مؤقت، فملف `verifications.json` **مش هيفضل** بعد كل نشر.
> علشان سجل دائم استخدم `DISCORD_LOG_WEBHOOK` — ده اللي هيوصلك كل محاولة لحظياً في روم خاص بالإدارة.

### الصور المطلوبة في `public/`
- `NOVA-LOGO.png` ✅ موجود
- `NOVA-BANNER.png` ← **احفظ صورة البانر هنا** (لو مش موجودة الصفحة تشتغل عادي بدون بانر).

## المميزات
- تصميم داكن (كروم + أزرق) متجاوب RTL، خطوط Tajawal + Orbitron.
- زر الشراء يفتح **واتساب** مباشرة برسالة جاهزة (الرقم في `settings.json`).
- زر متجر عائم في كل الصفحات.
