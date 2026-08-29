# AI Context — B-Auth
> آخر تحديث: 28/08/2026

## 8. حدود العرض الحالية
- `ScreenLayout` يستخدم `.console-card` بعرض أقصى `48.0625em` وعرض أدنى `16em`.
- `.screen-body` يحتفظ بـ `flex: 1` لضمان تمدد المحتوى داخل التخطيط.
- شاشة Splash: تم حذف `splash-topline`، واستبدال هوية `splash-brand` بالشعار المرفق، وتصغير `boot-ring` إلى 60% من الحجم السابق.
- شريط الحالة والتاريخ يدعمان العرض الزمني 12/24 وترجمة أسماء الأشهر حسب اللغة الحالية.

## 0. جلسة الاستعادة الحالية
- تم حذف محتويات الجذر بناءً على موافقة المستخدم مع الإبقاء على `.git` فقط، ثم فك الأرشيف إلى الجذر.
- نمط API المعتمد: Callback Injection؛ طبقة HTTP لا ترتبط مباشرةً بـ Zustand.
- قرار الحماية المعتمد: لا `eval()`؛ أي ترخيص مستقبلي يُتحقق منه بتوقيع رقمي عبر Middleware على الخادم.

## 1. Stack
- Frontend: Vite 6 + React 19 + TypeScript + Tailwind CSS 4.
- Backend: Node.js + Express + TypeScript.
- State: Zustand؛ التخزين مقتصر على اسم المستخدم المتذكَّر، والتوكن يظل في الذاكرة.
- API: Axios مع refresh token داخل HttpOnly cookie.

## 2. قرارات معمارية
- التطبيق الحالي Monorepo بمجلدي `Frontend` و`Backend`.
- تم حذف اعتماد TanStack Router غير المستخدم لتجنب تعارضات الراوتر؛ React Router ليس مفعّلاً بعد.
- لم يتم استخدام `eval` أو منطق ترخيص ديناميكي؛ قاعدة `no-eval` تظل سارية.
- الاستيرادات الخاصة بالواجهة تمر من `@a` في الملفات التي تستخدم React أو UI.

## 3. Module Map
```text
Backend/src/modules/{auth,users,roles,storage,health}
Frontend/src/{features,services,lib,i18n,alias,screens,components}
packages/{aliases,design-system,theme,utils}

- تدفق الواجهة الحالي: bootstrap → splash → error أو signin → home.
- signup اختياري ومغلق افتراضياً من `Frontend/src/app/features.ts`.
- `packages/design-system/components/outlined-input.tsx` هو مكوّن الحقول المشترك، ويدعم floating labels وRTL/LTR والحالات المختلفة.
```

## 4. قيود مهمة
- لا أسرار داخل الكود.
- لا localStorage للتوكنات.
- أي تغيير في قاعدة البيانات يحتاج migration موثقة.
- التعليقات الجديدة بالعربية المصرية، والكود بالإنجليزية.

## 5. حالة الأرشيف
تم استعادة المشروع بالكامل من `b-auth-04.zip` بعد إفراغ جذر بيئة v0 (سكافولد Next.js
افتراضي) بطلب صريح من المستخدم. تم حذف الأسرار وملفات البناء وبيانات التشغيل. المرجع المختصر
للمهارات والقرارات المعتمدة في `docs/SKILLS.md`.

## 6. التحقق
`pnpm typecheck`, `pnpm lint`, و `pnpm build` تمر بنجاح للـ Backend والـ Frontend.
تم أيضاً تشغيل `pnpm dev` والتحقق من مسار تسجيل الدخول الكامل في متصفح حقيقي.

## 7. تنفيذ اختبارات المصادقة والحماية — 28/08/2026
- تم اختبار التسجيل وتسجيل الدخول فعلياً من الواجهة باستخدام متصفح حقيقي؛ تسجيل دخول admin نجح وظهرت Home مع الجلسة والدور.
- تم التحقق من رسائل الخطأ في الواجهة، ومن أن backend يعمل عبر `/api/health` ويرجع `success: true`.
- أُضيفت اختبارات لحارس المصادقة والصلاحيات والأدوار، واختبارات لمعالجة AppError وZodError.
- تم تقوية حماية شاشة Home: أي محاولة انتقال إلى Home بدون مستخدم تعيد إلى Signin، وكذلك render الحماية نفسه.
- تمت مراجعة responsive على 390x844 للموبايل و768x1024 للتابلت مع RTL والوضع الداكن، ولم تظهر عناصر مقصوصة أو overflow واضح.
- النتيجة الحالية: 16 اختباراً ناجحاً، وtypecheck/lint/build ناجحة.

## 8. مرفقات الجلسة
- لم توجد ملفات مرفقة جديدة داخل `user_read_only_context` أثناء هذه الجلسة؛ تم حفظ لقطات الاختبار خارج المشروع داخل `/tmp/agent-browser/` حسب سياسة أدوات المتصفح.

## 10. حالة التوثيق — 29/08/2026
- تم إنشاء `README.md` في جذر المشروع ليشرح الملخص، التقنيات، البدء، الاستخدام، الترخيص، المساهمة، والاتصال.
- تم ربط README بصورة مرجع شاشة الإقلاع والشعار المحفوظين داخل `docs/references/images/`.
- نقطة التوقف المعتمدة: استكمال تحسينات Splash/Auth لاحقاً طبقاً للخطة النشطة، مع تحديث ملفات الاستمرارية بعد كل جلسة.

## 11. مرفق مرجع واجهة تسجيل الدخول — 29/08/2026
- تم حفظ الصورة المرفقة داخل `docs/references/images/auth-login-reference.png`.
- الصورة بتعرض تصور شاشة تسجيل الدخول وهوية B-Auth: تخطيط split-screen، شعار BM، لون ذهبي أساسي، خلفية grid هادئة، وكارت دخول بسيط.
- مصدر الصورة الأصلي: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZwzojLo9fzJPnKv55RJxfFt7TQjTwh.png`.
- الصورة مرجع بصري فقط؛ أي تنفيذ لاحق لازم يحافظ على منطق المصادقة الحالي ودعم RTL/LTR والثيمات.

## 9. مراجعة المشروع والخطة — 27/08/2026
- الجذر Monorepo فعلياً: `Backend`, `Frontend`, و`packages`، و`pnpm-workspace.yaml` هو مصدر تعريف الـ workspaces.
- Backend يستخدم Express وموديولات `auth`, `users`, `roles`, `storage`, `health`، مع JSON repositories حالياً وليس قاعدة SQL.
- Frontend يستخدم Vite وReact وZustand وi18next، وتدفق التشغيل في `main.tsx` state-based بدون Router مفعّل.
- خطة الاستعادة والتنظيف والجودة منفذة ومثبتة في السجلات.
- خطة `v0_plans/practical-scope.md` هي الخطة التشغيلية الحالية لإعادة تصميم Splash/Auth؛ لم يتم اعتبارها منفذة لمجرد وجودها.
- لا توجد حالياً تغييرات قاعدة بيانات أو migrations، ولا integrations خارجية مطلوبة لحالة المشروع الحالية.
- الفجوة التوثيقية السابقة كانت اختلاف حالة `docs/PLAN.md` عن الواقع؛ تم تصحيحها وتسجيل الخطة النشطة هنا.
