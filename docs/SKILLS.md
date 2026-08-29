# مرجع المهارات الفعّالة — B-Auth

> هذا الملف مرجع سريع ومختصر للمهارات التي تحكم هذا المشروع، لتسهيل المراجعة
> والاستكمال في جلسات لاحقة بدون الحاجة لإعادة تحميل كل مهارة بالكامل من جديد.
> المصدر الكامل لكل مهارة يبقى في نظام الذاكرة (`v0_memories/team/skills/*`)؛
> هذا الملف تلخيص تطبيقي لما هو **فعّال ومُطبَّق حالياً** في B-Auth تحديداً.

## 1. المهارات الفعّالة وترتيب أولويتها هنا

| # | المهارة | الدور في B-Auth |
|---|---|---|
| 1.1 | `rules` | القواعد العامة للتشغيل، التوثيق، الـ Monorepo، BUI، الـ API layers |
| 1.2 | `bomba-skills` | الدليل الموسّع (33 مهارة فرعية) للمعمارية، الجودة، الاختبارات، الأمان |
| 1.3 | `central-alias-system` | فرض الاستيراد المركزي `@a` في كل ملفات `Frontend/src` |
| 1.4 | `git-repo-master` | الترقيم الشجري للفروع والـ commits بالعربية المصرية (عند تفعيل Git) |
| 1.5 | `design-system` (Verdana Health) | **لا يُطبَّق حالياً** — B-Auth يستخدم هوية "Security Console" الخاصة به (انظر §4)، وليس منتج رعاية صحية |

## 2. القرارات المعتمدة نهائياً لهذا المشروع (تُغلق التعارضات المفتوحة في المهارات العامة)

هذه القرارات **تكسب** أي نص عام مخالف في `rules`/`bomba-skills`، لأنها Override موثّق
ومحدد النطاق لمشروع B-Auth فقط:

1. **طبقة HTTP (تعارض SKILL-022):** يُعتمد نمط **Callback Injection** حصرياً.
   - `Frontend/src/lib/api-client.ts` لا يقرأ التوكن من `localStorage` مباشرة ولا من `window`.
   - التوكن (access token) يبقى في الذاكرة فقط، و refresh token في HttpOnly cookie من الـ Backend.
   - ممنوع أي عودة لنمط `localStorage.getItem('token')` داخل axios interceptor.
2. **حماية الترخيص (تعارض SKILL-025 مقابل SKILL-005):** **لا يوجد** `eval()` ولا منطق ترخيص
   ديناميكي في B-Auth حالياً. قاعدة `no-eval` في ESLint تبقى فعّالة بدون استثناء.
   أي احتياج مستقبلي لتحقق ترخيص يُنفَّذ بتوقيع رقمي عبر Middleware على الخادم، لا بـ `eval`.
3. **State Management:** Zustand يحفظ فقط اسم المستخدم المتذكَّر (`remember username`)؛
   لا يُحفظ أي توكن أو بيانات جلسة في أي تخزين دائم (localStorage/sessionStorage/cookies من الفرونت).
4. **الراوتر:** لا `react-router-dom` ولا `@tanstack/react-router` مُفعّلين حالياً — تدفق الشاشات
   الحالي (`bootstrap → splash → error|signin → home`) يُدار عبر state محلي في `Frontend/src/screens`،
   وليس عبر مكتبة توجيه. أي إضافة راوتر مستقبلية تحتاج قرار موثّق جديد.
5. **الأسرار:** كل القيم في `Backend/.env` قيم تطوير محلية عشوائية (JWT secrets)، وليست أسرار إنتاج.
   `.env` مستثنى من Git عبر `.gitignore` الجذري. لا يُنسخ أي سر حقيقي داخل الكود أو التوثيق.

## 3. تطبيقات عملية لقواعد `rules`/`bomba-skills` في هذا الكود

- **Backend:** نمط `controller → service → repository` مطبّق في كل موديول تحت
  `Backend/src/modules/{auth,users,roles,storage,health}`، مع Zod schemas للتحقق،
  و `Backend/src/shared/response.ts` لتوحيد شكل `{ success, data, message }`.
- **الأخطاء:** `Backend/src/shared/app-error.ts` + `Backend/src/middleware/error-handler.ts`
  يطبّقان نمط أكواد الأخطاء الموحّدة (SKILL-023).
- **Frontend Alias:** `Frontend/src/alias/index.ts` هو نقطة الاستيراد المركزية `@a` (SKILL-012)،
  مع alias إضافية محلية (`@styles`, `@screens`) معرّفة في `vite.config.ts` — هذه ليست خرقاً
  للمهارة لأنها مسارات محلية داخل المشروع نفسه، وليست استيراداً مباشراً من مكتبة خارجية.
- **التصميم:** `packages/design-system` يوفّر design tokens (HSL + em/rem) خاصة بهوية
  B-Auth ("Security Console" — طابع طرفية/Terminal غامق)، لا هوية Verdana Health.
  الالتزام بـ HSL فقط وem/rem فقط ودعم RTL/LTR يبقى ساري من `design-system` كمبدأ عام،
  حتى لو لوحة الألوان والمكوّنات نفسها مختلفة عن Verdana Health.
- **التوثيق:** كل ملف كود جديد يحمل File Header بالعربية المصرية (SKILL-006)، والتعليقات
  الداخلية تشرح "ليه" لا "إيه".

## 4. هوية B-Auth البصرية (مرجع سريع)

- الطابع: Terminal/Security Console غامق — خلفية شبه سوداء، لون أساسي كهرماني (amber/orange)،
  خط Mono للعناوين، بطاقات بحدود دقيقة وزوايا خفيفة الاستدارة.
  هذا اختيار تصميمي لمنتج B-Auth نفسه، منفصل عن نظام Verdana Health الصحي في مهارة `design-system`.

## 5. بروتوكول الاستمرارية بين الجلسات

في بداية كل جلسة: اقرأ بالترتيب `docs/AI_CONTEXT.md` → `docs/AI_SESSION.md` → `docs/TODO.md` →
هذا الملف (`docs/SKILLS.md`) عند الحاجة لمراجعة القرارات المعتمدة.
في نهاية كل جلسة: حدّث `docs/AI_SESSION.md`، `docs/CHANGELOG.md`، و `docs/DEVELOPMENTS.md`
بترقيم شجري جديد (انظر بروتوكول التحديث في `docs/DEVELOPMENTS.md`).
