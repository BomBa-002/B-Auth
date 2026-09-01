# TODO — B-Auth

## 1. الحالة الحالية
- [x] تطبيق قرار Callback Injection في عميل HTTP.
- [x] توثيق قرار حماية الترخيص بدون `eval()`.
- [x] إصلاح dependencies وCSS اللازمة لنجاح build.
- [x] إفراغ الجذر وإعادة بناء هيكل المشروع.
- [x] نقل محتويات مشروع `b-auth-03.zip` كاملة إلى جذر بيئة v0.
- [x] اعتماد @tanstack/react-router للتنقل المركزي بين الصفحات.
- [x] تثبيت قرار Zustand: persistence لاسم المستخدم فقط، والتوكن في الذاكرة.
- [x] تثبيت قرار الترخيص: لا `eval` ولا منطق ترخيص ديناميكي حالياً.
- [x] إنشاء توثيق الاستمرارية.
- [x] فحص TypeScript.
- [x] تشغيل `pnpm dev` واختبار مسار تسجيل الدخول الأساسي في متصفح حقيقي.
- [x] إضافة `docs/SKILLS.md` كمرجع مختصر للمهارات والقرارات المعتمدة.
- [x] اختبار التسجيل وتسجيل الدخول فعلياً من الواجهة.
- [x] إضافة اختبارات auth guard ومعالجة الأخطاء؛ إجمالي 16 اختباراً ناجحاً.
- [x] تقوية حماية شاشة Home ضد الوصول بدون جلسة.
- [x] مراجعة responsive على mobile وtablet في RTL والوضع الداكن.
- [x] تحديث `AI_CONTEXT.md` و`AI_SESSION.md` وتوثيق نتائج الجلسة.
- [x] التأكد من عدم وجود مرفقات جديدة قابلة للنسخ إلى `docs/`.

## 2. الأولويات
- [x] 🔴 HIGH — اعتماد root scripts والـ aliases المركزية `@a`.
- [x] 🔴 HIGH — بناء مسارات وصفحات الواجهة المطلوبة.
- [x] 🔴 HIGH — إضافة اختبارات auth والخدمات.
- [x] 🟡 MED — إضافة ESLint للـ Frontend وتشغيل lint.
- [x] 🟢 LOW — تشغيل preview واختبار المسار الأساسي.

## 3. الخطة النشطة: تثبيت التنقل وجودة المنتج
- [x] 🔴 HIGH — توحيد i18n وتطبيق `lang` و`dir` على مستوى المستند.
- [x] 🔴 HIGH — إزالة النصوص الثابتة من Splash/Auth/System.
- [x] 🟡 MED — اعتماد @tanstack/react-router وربط مسارات `/`, `/signin`, `/signup`, `/home`, `/error`.
- [x] 🟡 MED — الحفاظ على تصميم Splash/Auth الحالي بدون إعادة تصميم.
- [x] 🟡 MED — اختبار English/LTR وArabic/RTL في المتصفح.
- [x] 🟡 MED — إضافة اختبارات Frontend أساسية لـ Auth error mapping.
- [x] 🟡 MED — إصلاح تحذير حجم bundle عبر manual chunks.
- [x] 🟡 MED — إضافة اختبار Frontend للمسارات الأساسية وAuth error flow.
- [x] 🟡 MED — إضافة اختبارات تفاعلية لـ SmartButton وActionLockManager.
- [x] 🟡 MED — إضافة اختبارات تفاعلية كاملة لـ Router وAuth flow.
- [x] 🟡 MED — تشغيل Frontend وBackend معاً والتحقق من Preview و`/api/health`.
- [x] 🟡 MED — مراجعة Console وAccessibility وWeb Vitals على Preview.
- [ ] 🟢 LOW — تثبيت خط عربي bundled لو ظل glyph fallback مؤثراً.

## 4. نقطة الاستكمال القادمة
- [x] مراجعة خطة SmartInput بعد التشتت وتحديد المنجز والمتبقي في `v0_plans/swift-build.md`.
- [x] تشغيل التحقق الكامل: `pnpm typecheck` و`pnpm lint` و`pnpm test` و`pnpm build`.
- [x] اختبار المسارات باللغتين English/LTR وArabic/RTL في Preview.
- [ ] استكمال إعادة تصميم Splash/Auth من الخطة بعد اعتماد المرجع البصري النهائي.

## 5. آخر تعديلات معتمدة
- [x] ضبط `.console-card` في `ScreenLayout` إلى `max-width: 48.0625em` و`min-width: 16em`.
- [x] توثيق تغييرات StatusBar وSplash والتاريخ المترجم.
- [x] حفظ الشعار المرفق داخل `docs/references/images/`.

## 5. ملاحظات المراجعة
- لا توجد حالياً مهمة Database أو migration.
- لا يتم إضافة Router أو Redis أو Queue بدون قرار معماري موثق.

## 6. مراجعة الجودة — 29/08/2026
- [x] TypeScript وESLint والاختبارات وBuild ناجحين.
- [x] Preview متراجع على desktop وmobile.
- [x] RTL/LTR والثيم الداكن متراجعان في المتصفح.
- [x] Backend health endpoint متراجع ويرجع `success: true`.
- [x] التحقق من عدم وجود أخطاء Console أو whitespace errors.
- [x] تجهيز التوثيق للـ Pull Request.

## 8. توثيق مرجع واجهة تسجيل الدخول — 29/08/2026
- [x] حفظ الصورة المرفقة داخل `docs/references/images/auth-login-reference.png`.
- [x] إضافة الصورة إلى `README.md`.
- [x] توثيق وصف الصورة ومصدرها في `AI_CONTEXT.md` و`AI_SESSION.md`.
- [ ] استخدام المرجع عند استكمال إعادة تصميم Splash/Auth.

## 7. بنود مستقبلية
- [ ] 🟡 MED — استكمال إعادة تصميم Splash/Auth حسب الخطة النشطة.
- [ ] 🟡 MED — إضافة Database خارجية فقط بعد اعتماد قرار معماري وتكامل مناسب.
- [ ] 🟢 LOW — تفعيل S3 عند الحاجة الفعلية لتخزين الملفات.

## 9. SmartInput — 01/09/2026
- [x] استكمال ARIA والـ controlled state وحالات validation.
- [x] إصلاح ظهور أزرار clear/password/search مع التركيز أو وجود قيمة.
- [x] إضافة تمييز نتائج البحث، initials/avatar، والسهم للعنصر النشط.
- [x] إضافة خصائص autofill دفاعية ودعم Firefox.
- [x] تشغيل typecheck/lint/test/build واختبار شاشة Auth الداكنة في المتصفح.
- [x] إضافة `tabIndex={-1}` لجميع أزرار الإجراءات الداخلية لمنع وصول Tab إليها أو تفعيلها عبر مسار الكيبورد الحالي.
- [x] التحقق من خصائص التركيز في المتصفح وعدم انتقال Tab إلى أزرار الإجراءات.
- [x] اختبار Light/RTL ولقطات إضافية بعد اعتماد الشكل النهائي.
- [x] التحقق من شاشة Auth في LTR وRTL مع تبديل الثيم من Preview.
- [ ] تثبيت خط عربي bundled لو مطلوب إصلاح glyph fallback في بيئة Preview.
