# Changelog

## 1.18.0 — 02/09/2026

### Verified
- إعادة تشغيل بيئة Backend وFrontend بدون تعارض منافذ.
- `pnpm typecheck` و`pnpm lint` و`pnpm test -- --run` و`pnpm build` نجحوا.

### Note
- Preview ما زال محتاج إعادة فحص بجلسة متصفح جديدة؛ المتصفح الحالي عرض صفحة فاضية بدون أخطاء Console واضحة.

## 1.17.0 — 02/09/2026

### Changed
- إعادة بناء Auth layout بتقسيم بصري مستوحى من المرجع: لوحة هوية جانبية وكارت دخول واضح.
- تطوير Button primitive بإضافة `link` و`xs/xl` و`shape` و`fullWidth` و`startIcon/endIcon`.
- إضافة responsive fallback يخفي اللوحة الجانبية على الشاشات الصغيرة بدون كسر التدفق.

### Verified
- `pnpm typecheck` و`pnpm test -- --run` و`pnpm build` نجحوا.
- تم إصلاح تحذير Fast Refresh في Button، و`pnpm lint` يمر بدون تحذيرات.

## 1.16.0 — 02/09/2026

### Added
- إضافة اختبارات لحماية تنقل Home ومسارات الشاشات المدعومة.

### Changed
- فصل `resolveScreenPath` عن `AppShell` لتسهيل التحقق من Auth flow.

### Verified
- `pnpm test -- --run` نجح: 29 اختباراً.

## 1.15.0 — 02/09/2026

### Added
- إضافة اختبارات تفاعلية لـ SmartButton وActionLockManager.

### Fixed
- السماح لـ SmartButton بتنفيذ action بدون lock اختياري، مع الحفاظ على منع التكرار عند استخدام lockKey أو lockGroup.

### Verified
- `pnpm typecheck` و`pnpm lint` و`pnpm test -- --run` و`pnpm build` نجحوا.


## 1.14.0 — 01/09/2026

### Added
- إضافة `ActionLockManager` لمنع التكرار والتعارض بين الأفعال.
- إضافة `SmartButton` لحالات التحميل والأقفال ودورة تنفيذ موحدة.

### Changed
- تطبيق الأزرار الذكية على تدفقات تسجيل الدخول والتسجيل وإعادة المحاولة.

### Verified
- `pnpm typecheck` و`pnpm test -- --run` نجحوا.

## 1.13.0 — 01/09/2026

### Documentation
- تحديث `README.md` ليشرح هوية B-Auth وحالة المشروع ومميزاته وهيكله.
- تجهيز وصف GitHub About متوافق مع وظيفة المشروع وتقنياته.

## 1.12.0 — 01/09/2026

### Fixed
- تثبيت لون أيقونة التحذير `Warning` على `--color-err` بدون توريث لون عام من عنصر التنبيه.
- توثيق نقطة الاستكمال وخطوة رفع التغيير على GitHub.

### Verified
- التغيير محصور في `Frontend/src/styles/globals.css` مع مراجعة حالة Git.

## 1.11.0 — 01/09/2026

### Changed
- ضبط ظهور Custom Autocomplete في `SmartInput` باستخدام `showOnFocus` و`minChars`.
- تحسين readonly guard لمكافحة Autofill مع احترام `autoFocus` والقيمة الابتدائية.
- توثيق خطة أدوات Smart في `docs/BombaSmart.md`.

### Verified
- تم تحديث قواعد أزرار الإجراءات وحالات الخطأ حسب متطلبات المراجعة.


## 1.10.0 — 01/09/2026

### Verified
- تشغيل Frontend وBackend مرة واحدة بدون تعارض منافذ.
- التحقق من حلقة Splash والانتقال إلى Auth في Dark/LTR على Preview بحجم `939x726`.
- فحص Accessibility snapshot وConsole بدون أخطاء تطبيقية.
- `GET /api/health` رجّع `success: true` و`status: ok`.
- Web Vitals في بيئة التطوير: `TTFB 18.7ms` و`FCP/LCP 504ms` و`CLS 0`.

## 1.9.0 — 01/09/2026

### Fixed
- إصلاح `boot-ring-center` بحيث تتحرك الحلقة المرئية بنفس قيمة عداد الإقلاع عبر `--progress`.
- توحيد توقيت الانتقال من Splash بعد انتهاء مدة الإقلاع الدنيا، وإزالة الـ timeout المنفصل.
- إضافة دلالات `progressbar` وقيم ARIA للعداد.

### Verified
- `pnpm typecheck` و`pnpm lint` و`pnpm test` و`pnpm build` نجحوا.
- `/api/health` رجّع `success: true`.
- Preview اشتغل على `http://localhost:3000`، وظهر أثناء الاختبار أن الحالة وصلت إلى 68% مع `--progress: 244.8deg` بدون أخطاء تطبيقية في Console.

## 1.8.0 — 01/09/2026

### Fixed
- إزالة زرار Exit من شاشات الأخطاء والاكتفاء بإعادة المحاولة.
- إصلاح مشكلة تشغيل Preview داخل Sandbox الناتجة عن تشغيل dev servers مكررة على نفس المنافذ.

### Verified
- `pnpm typecheck` و`pnpm lint` و`pnpm test` و`pnpm build` نجحوا.
- `/api/health` شغال وPreview ظاهر على `http://localhost:3000`.

## 1.7.0 — 01/09/2026

### Changed
- اختبار شاشة المصادقة في Light/LTR وLight/RTL على Preview.
- تحسين fallback لخط RTL في design tokens باستخدام خطوط متاحة بشكل أوسع.
- توثيق ملاحظة glyph fallback في بيئة المتصفح كعنصر متابعة اختياري.

### Verified
- `pnpm typecheck` نجح.
- `pnpm lint` نجح.
- `pnpm test` نجح: 16 اختباراً.
- `pnpm build` نجح.

## 1.6.0 — 29/08/2026

### Documentation
- إنشاء `README.md` في جذر المشروع بالأقسام المطلوبة.
- توثيق نقطة التوقف الحالية واستكمال العمل لاحقاً في `AI_CONTEXT.md` و`AI_SESSION.md` و`TODO.md`.
- توثيق صور مرجع شاشة الإقلاع والشعار داخل `docs/references/images/` وربطها بالـ README.

### Scope
- لم يتم تعديل كود التطبيق أو الاعتماديات في جلسة التوثيق.

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
