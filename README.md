# B-Auth

نظام مصادقة وإدارة صلاحيات modular مبني كـ monorepo، ومصمم يكون نقطة بداية آمنة وقابلة للتوسع للتطبيقات اللي محتاجة تسجيل دخول، جلسات، أدوار، وصلاحيات.

## حالة المشروع

المشروع حالياً في مرحلة التطوير النشط. الأساسيات الخاصة بالإقلاع، فحص صحة التشغيل، المصادقة، دعم اللغتين، والثيم الداكن موجودة، وبيتم توثيق خطوات التطوير داخل مجلد `docs/` بشكل مستمر.

## أبرز المميزات

- تسجيل الدخول باسم المستخدم أو البريد الإلكتروني أو رقم الجوال.
- إنشاء حساب جديد عند تفعيل الميزة (مع رقم جوال اختياري).
- جلسات آمنة باستخدام access token في الذاكرة وrefresh token داخل HttpOnly cookie.
- Remember Me بيمدّ عمر الجلسة ويحفظ المعرّف فقط (مش الباسورد).
- أدوار وصلاحيات مع شاشة Home محمية وطبقة فحص `can()` في الواجهة.
- واجهة عربية/إنجليزية مع دعم RTL/LTR.
- ثيم داكن وقابلية توسعة لنظام التصميم.
- شاشة إقلاع بفحص Runtime Health وحالات استعادة واضحة.
- فحوص صحة منفصلة: `/api/health/live` و`/api/health/ready`.
- تشغيل كامل بـ Docker Compose مع MinIO للتخزين وhealthchecks.

## هيكل المشروع

```text
B-Auth/
├── Backend/     # خادم Express وطبقة المصادقة والـ API
├── Frontend/    # واجهة React وVite
├── packages/    # حزم مشتركة قابلة لإعادة الاستخدام
└── docs/        # التوثيق المعماري وسجل التطوير والاستمرارية
```

## ملخص المشروع

المشروع مقسوم إلى واجهة Frontend وخادم Backend:

- شاشة إقلاع وفحص جاهزية التشغيل.
- تسجيل الدخول باسم المستخدم أو البريد الإلكتروني.
- إنشاء حساب جديد عند تفعيل الميزة.
- جلسات آمنة باستخدام access token في الذاكرة وrefresh token داخل HttpOnly cookie.
- أدوار وصلاحيات للمستخدمين.
- شاشة Home محمية من الوصول بدون جلسة.
- رسائل أخطاء مترجمة ودعم RTL/LTR.

### صور شاشات النظام

![مرجع شاشة الإقلاع وتخطيط النظام](docs/references/images/M_000-splash-reference.png)

![شعار B-Auth](docs/references/images/Logo-favicon.svg)

![مرجع واجهة تسجيل الدخول وهوية B-Auth](docs/references/images/auth-login-reference.png)

> مرجع بصري لشاشة تسجيل الدخول: تخطيط split-screen، لون ذهبي للهوية، خلفية grid، وكارت دخول بسيط. الصورة محفوظة داخل `docs/references/images/auth-login-reference.png` ومصدرها [رابط الصورة الأصلي](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZwzojLo9fzJPnKv55RJxfFt7TQjTwh.png).

## التقنيات المستخدمة

- Frontend: Vite 6، React 19، TypeScript، Tailwind CSS 4.
- Backend: Node.js 20+، Express، TypeScript.
- الحالة: Zustand، مع حفظ اسم المستخدم المتذكَّر فقط.
- الترجمة: i18next وreact-i18next للغتين العربية والإنجليزية.
- الشبكة: Axios مع Callback Injection.
- التحقق: Zod.
- الأمان: Helmet، CORS، rate limiting، bcryptjs، JWT، HttpOnly cookies.
- الاختبارات: Vitest.
- التخزين الحالي: JSON repositories للتطوير، مع خدمة S3-compatible اختيارية للملفات.
- إدارة الحزم: pnpm workspaces.

## البدء

المتطلبات:

- Node.js 20 أو أحدث.
- pnpm.

ثبّت الاعتماديات:

```bash
pnpm install --frozen-lockfile
```

شغّل الواجهة والخادم معاً:

```bash
pnpm dev
```

أوامر مفيدة:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

الخادم يعمل افتراضياً على المنفذ `4000`، وواجهة Vite تعمل افتراضياً على المنفذ `3000`.

### بيانات الدخول التطويرية

عند أول تشغيل بيتعمل seed لمستخدم admin تلقائياً (idempotent):

| الحقل | القيمة |
|---|---|
| اسم المستخدم | `admin` |
| البريد الإلكتروني | `admin@b-auth.local` |
| كلمة المرور | `Admin123!` |
| الدور | Admin (كل الصلاحيات) |

> بيانات الدخول دي للتطوير فقط — غيّرها عبر `SEED_ADMIN_*` في `Backend/.env` قبل أي نشر حقيقي.

### تشغيل بـ Docker

```bash
pnpm docker:up     # يبني ويشغّل Frontend + Backend + MinIO
pnpm docker:down   # يوقف ويحذف الـ volumes
```

- الواجهة: `http://localhost:3000` (nginx بيعمل proxy للـ `/api` — نفس الأصل فالـ cookies بتشتغل من غير CORS).
- الـ API: `http://localhost:4000` مع `/api/health/live` و`/api/health/ready`.
- MinIO Console: `http://localhost:9001` (افتراضي `minioadmin/minioadmin` — غيّره عبر `MINIO_ROOT_*`).
- الـ Backend بيعمل seed تلقائي عند الإقلاع وبيفحص جاهزية MinIO قبل ما يبقى healthy.

## الاستخدام

1. شغّل المشروع باستخدام `pnpm dev`.
2. افتح واجهة Frontend من عنوان Vite الظاهر في الطرفية.
3. استخدم بيانات المستخدم المهيأة في بيئة التطوير أو أنشئ حساباً جديداً إذا كانت ميزة التسجيل مفعلة.
4. بعد تسجيل الدخول، تظهر شاشة Home حسب الدور والصلاحيات.
5. استخدم زر اللغة لتبديل العربية والإنجليزية، وزر الثيم لتبديل الوضع الفاتح والداكن.

للتفاصيل المعمارية وسجل الجلسات، راجع:

- `docs/AI_CONTEXT.md`
- `docs/AI_SESSION.md`
- `docs/TODO.md`
- `docs/CHANGELOG.md`

## الترخيص

لم يتم اعتماد ترخيص مفتوح المصدر للمشروع حتى الآن. كل الحقوق محفوظة للمالك إلى أن يتم إضافة ملف ترخيص رسمي.

## المساهمة

المساهمة مرحب بها بعد الاتفاق على نطاق التغيير:

1. راجع ملفات التوثيق داخل `docs/` قبل التعديل.
2. حافظ على فصل Frontend وBackend وقواعد الاستيراد المركزية.
3. أضف أو حدّث الاختبارات الخاصة بأي سلوك جديد.
4. شغّل `pnpm typecheck` و`pnpm lint` و`pnpm test` و`pnpm build` قبل تقديم التغيير.
5. اكتب وصفاً واضحاً للتغيير بالعربية المصرية في الـ commit أو Pull Request حسب قواعد المستودع.

## الاتصال

للاستفسارات أو طلبات المساهمة، استخدم Issues وPull Requests في مستودع GitHub الخاص بالمشروع، أو تواصل مع مالك المشروع عبر قناة الفريق المعتمدة.
