# B-Auth — التوثيق المعماري الموحّد

> آخر تحديث: 2026-09-03 — يغطي: البنية العامة، التوجيه، تدفق المصادقة، الـ RBAC، الصحة، الـ Docker، الأخطاء، الأمان.

## 1.1 التوجيه واللغة (Routing & i18n)

- **بادئة لغة إلزامية في الـ URL**: كل المسارات على شكل `/{lang}/...` مثل `/en/signin` و`/ar/home` — المصدر: `Frontend/src/router.tsx`.
- **الـ URL هو المرجع الأعلى للغة**: عند الفتح/التحديث تُقرأ اللغة من المسار وتُزامن مع إعدادات التطبيق، وتبديل اللغة من الواجهة (`LanguageToggle`) يعدّل الـ URL نفسه.
- **بوابة الافتتاحية الإجبارية**: أي فتح مباشر لرابط أو تحديث صفحة (F5) يمر بالـ `SplashScreen` أولاً حتى اكتمال الإقلاع، ثم يُوجَّه حسب الصلاحيات (زائر → `/signin`، مسجّل → `/home`). التنقل الداخلي فوري بدون splash.
- **المسارات القديمة بدون لغة** (`/`، `/signin`، ...) تُحوَّل تلقائياً للمسار المكافئ بلغة التطبيق الحالية، وأي لغة غير مدعومة تُحوَّل للأقرب (`ar` → عربي، غير كده → إنجليزي).
- **المستخدم المسجّل** ممنوع يفتح شاشات الدخول — بيتحوّل تلقائياً للرئيسية.

## 1.2 المراقبة المستمرة لصحة النظام (Runtime Health)

- بعد اكتمال الإقلاع، `runtime-health-monitor.ts` بيفحص `/api/health` بشكل دوري: كل 15 ثانية طبيعي، وكل 4 ثوانٍ أثناء الانقطاع (فحص متكيّف).
- **عند انقطاع الـ Backend**: حجب فوري (`HealthBlocker`) فوق أي شاشة (دخول/تسجيل/رئيسية) بعنوان الخطأ وتفاصيله، مع زر فحص فوري (`checkNow`).
- **عند عودة الخدمة**: الفحص السريع بيكتشف الاسترجاع تلقائياً وبيرفع الحجب — المستخدم بيرجع لنفس الشاشة اللي كان فيها بدون تدخل يدوي أو reload.
- الفحص بيتوقف تلقائياً لما التاب يبقى مخفي (`document.hidden`) وبيستأنف عند الرجوع.

## 1. البنية العامة

Monorepo بـ pnpm workspaces:

```text
B-Auth/
├── Backend/            # Express + TypeScript — طبقات: Routes → Validation → Service → Repository
│   └── src/modules/    # auth / users / roles / storage / health
├── Frontend/           # React 19 + Vite 6 + Tailwind 4
│   └── src/            # screens / features / services / components / alias
├── packages/           # حزم مشتركة: design-system / theme / aliases / utils
└── docs/               # التوثيق
```

- **نقطة الاستيراد المركزية**: `Frontend/src/alias/index.ts` (`@a`) — مصدرها `packages/aliases/alias.config.ts`. ممنوع استيراد مباشر من react أو مسارات نسبية داخل الشاشات والمكوّنات.
- **البيانات**: JSON repositories في `Backend/data/` للتطوير (users / roles / permissions / sessions) — بتنشأ تلقائياً لو مش موجودة.
- **التخزين**: MinIO/S3 اختياري — الـ Backend يشتغل في وضع degraded لو مش مُهيّأ.

## 2. تدفق المصادقة (Auth Flow)

### تسجيل الدخول
1. `POST /api/auth/login` بـ `{ identifier, password, rememberMe }` — الـ identifier بيتطابق مع **username أو email أو phone** (مطابقة الجوال بالأرقام فقط عشان تتجاهل التنسيق).
2. التحقق بـ zod (`auth.schemas.ts`) ثم bcrypt ثم إنشاء session في `sessions.json`.
3. الرد: `accessToken` (JWT قصير العمر) + `user` عام (بدون hash) + `persistent`.
4. الـ refresh token بيتحط في **HttpOnly cookie** (`path=/api/auth`) — عمرها `JWT_REFRESH_TTL_SESSION` (يوم) أو `JWT_REFRESH_TTL_REMEMBER` (30 يوم) حسب `rememberMe`.

### تجديد الجلسة (Bootstrap)
1. عند الإقلاع: `POST /api/auth/refresh` بالـ cookie → access token جديد + user.
2. الـ Frontend بيحتفظ بالـ access token **في الذاكرة فقط** (Zustand بدون persist) — localStorage فيه `rememberedUsername` بس.
3. Axios interceptor بيعمل **single-flight refresh**: لو 401، طلب refresh واحد مشترك لكل الطلبات المتزامنة، مع استثناء `/auth/refresh` نفسه لمنع الحلقة اللانهائية.

### تسجيل الخروج
`POST /api/auth/logout` بيلغي الـ session في الـ Backend ويمسح الـ cookie، وبعدها الـ Frontend بيمسح حالته المحلية (`useLogout` hook).

## 3. الأدوار والصلاحيات (RBAC)

- النموذج: `User → roleIds → Role → permissionIds → Permission (key زي "users:read")`.
- **Backend**: `requireAuth` ثم `requirePermission("users:write")` على مستوى الـ routes.
- **Frontend**: طبقة موحّدة في `features/auth/lib/permissions.ts`:
  - `can(user, "users:read")` — فحص مباشر مع دعم wildcard (`storage:*`).
  - `canAny(user, [...])` — أي صلاحية من مجموعة.
  - `useCan("users:write")` — hook تفاعلي بيتحدث مع تغيّر الجلسة.
- الـ permissions بتوصل للواجهة كمفاتيح جوه الـ JWT والـ user object — مش كـ IDs.

## 4. الصحة والإقلاع (Health & Bootstrap)

- `GET /api/health/live` — العملية حية (بدون فحص اعتماديات) — للـ liveness probe.
- `GET /api/health/ready` — جاهز لخدمة الطلبات + فحص الـ storage — للـ readiness probe.
- `GET /api/health` — التقرير الكامل.
- **Bootstrap state machine** في الواجهة: `idle → running → retrying → ready | degraded | blocked | error` مع 3 محاولات بـ backoff، وشاشة استعادة (Recovery UI) عند الفشل.

## 5. Docker

### وضع النشر (production)

```bash
pnpm docker:up      # docker compose up --build
pnpm docker:down    # docker compose down -v
```

| الخدمة | المنفذ | ملاحظات |
|---|---|---|
| frontend | 3000→80 | nginx: SPA fallback + proxy `/api` → backend (نفس الأصل للـ cookies) |
| backend | 4000→4000 | seed تلقائي عند الإقلاع، healthcheck على `/api/health/ready` |
| minio | 9000/9001 | S3-compatible، `minio-init` بينشئ الـ bucket |

- الـ Dockerfiles multi-stage بـ context = جذر المستودع (عشان الـ workspace packages).
- الـ backend بيشتغل بـ non-root user و`/app/data` volume للبيانات.

### وضع التطوير (تشغيل حي)

```bash
pnpm docker:dev:up      # docker compose -f docker-compose.dev.yml up --build
pnpm docker:dev:down    # إيقاف الحاويات
pnpm docker:dev:logs    # متابعة السجلات
```

- نفس الخدمات الثلاثة (backend + frontend + minio) لكن بمراحل `dev` في الـ Dockerfiles:
  - **backend**: `tsx watch` مع `./Backend/src` مربوطة كـ volume — أي تعديل بيعمل restart فوري.
  - **frontend**: `vite dev` مع `./Frontend/src` مربوطة كـ volume — HMR فوري، والـ proxy بيوصل على الـ backend عبر `VITE_API_PROXY_TARGET`.
  - **minio**: نفس إعدادات النشر.
- بيانات الـ backend في وضع التطوير بتتحفظ في `./Backend/data` المحلية (مش volume مجهول) عشان تتشارك مع التشغيل المحلي.

## 5.1 نظام الأخطاء الموحّد

- **الـ Backend** بيرجّع دايماً شكل `ErrorEnvelope` فيه `error.code` موحّد (زي `INVALID_CREDENTIALS` / `VALIDATION_ERROR`) — المصدر: `shared/app-error.ts` + `middleware/error-handler.ts`.
- **الـ Frontend** بيترجم الكود لرسالة مفهومة عبر `Frontend/src/lib/resolve-api-error.ts`:
  - وضع التطوير → عربي دايماً (تسهيلاً للـ debugging).
  - وضع النشر → لغة الواجهة الحالية، واللغة الابتدائية بتتبع لغة النظام (افتراضي إنجليزي).
  - كود غير معروف + رسالة من الخادم → تُعرض كما هي (مفيدة لرسائل CONFLICT التفصيلية).
- مفاتيح الترجمة تحت `errors.codes.*` في `i18n/locales/{ar,en}.json`.

## 6. الأمان

- **الجلسات**: access token في الذاكرة فقط، refresh في HttpOnly cookie بمسار محصور `/api/auth`.
- **كلمات المرور**: bcrypt (10 rounds).
- **Rate limiting**: عام + حد أشد على الـ login.
- **Helmet + CORS** مقيّد بـ `CORS_ORIGIN`.
- **أسرار**: `Backend/.env` غير متتبَّع في git — انسخ من `.env.example`.
- **التحقق**: zod على كل مدخلات الـ API، وتطبيع رقم الجوال قبل التخزين والمطابقة.

## 7. الاختبارات والتحقق

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

- Backend: اختبارات auth (login/logout/refresh/phone) + health + RBAC.
- Frontend: اختبارات المكوّنات + useLogout + permissions.
