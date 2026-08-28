# Changelog

## 1.5.0 — 27/08/2026

### Documentation
- مراجعة شاملة لهيكل Monorepo وBackend وFrontend والحزم المشتركة.
- توحيد حالة التنفيذ بين `docs/PLAN.md` و`v0_plans/practical-scope.md`.
- تحديث `AI_CONTEXT.md` بخرائط الموديولات، الحدود الحالية، والفجوات المتبقية.
- تحديث `AI_SESSION.md` و`TODO.md` لتحديد نقطة الاستكمال القادمة.

### Scope
- لم يتم تعديل كود التطبيق أو الاعتماديات في جلسة التوثيق.
- الخطة النشطة المتبقية: إعادة تصميم Splash/Auth وتغطية i18n وRTL/LTR.

### Verified
- المراجعة اعتمدت على الملفات الحالية داخل المشروع وسجلات التحقق السابقة؛ لم يتم إعادة تشغيل أوامر البناء في جلسة التوثيق.

## 1.4.0 — 27/08/2026

### Changed
- إفراغ جذر بيئة v0 بالكامل (Next.js scaffold افتراضي) واستعادة مشروع B-Auth
  كاملاً من أرشيف `b-auth-03.zip` (Backend + Frontend + packages + docs).
- استبعاد `dist/`, `node_modules`, و `package-lock.json` من عملية النقل للحفاظ
  على `pnpm-lock.yaml` كمصدر الحقيقة الوحيد للاعتماديات.
- إضافة `dist/` و `coverage/` إلى `.gitignore` الجذري.
- إضافة `docs/SKILLS.md` كمرجع مختصر للمهارات الفعّالة والقرارات المعتمدة نهائياً.

### Verified
- `pnpm install` نجح (513 حزمة، lockfile بدون تغيير).
- `pnpm typecheck` نجح (Backend + Frontend).
- `pnpm lint` نجح (Backend + Frontend، بدون مخالفات).
- `pnpm build` نجح (Backend + Frontend).
- `pnpm dev` تم تشغيله فعلياً؛ تدفق تسجيل الدخول اختُبر في متصفح حقيقي بنجاح
  (admin → Hello, Administrator).

## 1.3.0 — 27/08/2026

### Changed
- إعادة تهيئة الجذر من الأرشيف مع الحفاظ على `.git`.
- اعتماد Callback Injection لحقن access token في Axios بدون ربط مباشر بالـ store.
- تثبيت قرار أمان الترخيص: تحقق توقيع رقمي على الخادم بدلاً من `eval()`.
- إضافة أنواع React و`lucide-react` كاعتماديات لحزمة design-system.
- إصلاح CSS import غير صالح كان يمنع build.

### Verified
- `pnpm typecheck` نجح.
- `pnpm lint` نجح.
- `pnpm build` نجح.


## 1.2.0 — 27/08/2026

### Changed
- تحويل root scripts لتشغيل Monorepo باستخدام `pnpm --filter`.
- توحيد استيرادات Frontend على alias المركزي `@a`.
- إضافة ESLint 9 وFlat Config للـ Frontend والـ Backend.
- إصلاح مخالفات `no-unused-vars` و`prefer-const` في Backend.

### Verified
- `pnpm lint` نجح من الجذر.
- `pnpm typecheck` نجح من الجذر.
- `pnpm build` نجح للـ Backend والـ Frontend من الجذر.

## 1.1.0 — 27/08/2026

### Added
- إضافة `docs/AGENTS.md` لقواعد المشروع والمهارات الفعالة.
- إضافة `docs/PLAN.md` لخطة التنفيذ المرحلية.
- إضافة `docs/DEVELOPMENTS.md` للتطورات بترقيم شجري.

### Verified
- `pnpm install` نجح.
- Backend وFrontend typecheck نجحا.
- Frontend lint متوقف لعدم وجود ESLint في dependencies الخاصة به.

## 1.0.0 — 26/08/2026

### Changed
- إزالة `@tanstack/react-router` غير المستخدم من Frontend.
- توثيق قرارات TanStack Router وZustand والترخيص.
- إضافة ملفات استمرارية المشروع داخل `docs/`.

### Verified
- `pnpm typecheck` يمر للـ Backend والـ Frontend.
