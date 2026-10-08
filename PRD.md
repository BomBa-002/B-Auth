# PRD — BombaSmart و App Background

## 1. معلومات الوثيقة

- **اسم المنتج:** B-Auth / BombaSmart
- **النطاق:** منظومة مكونات الواجهة الذكية، ومكوّن الخلفية البصرية العامة `AppBackground`
- **الملفات الأساسية الحالية:**
  - `Frontend/src/components/app-background.tsx`
  - `Frontend/src/components/ui/smart-input.tsx`
  - `Frontend/src/components/ui/smart-button.tsx`
  - `docs/BombaSmart.md`
  - `Frontend/src/alias/index.ts`
- **الجمهور:** المطورون، الـ AI agents، مراجعي الكود، ومَن سيكمل تطوير المشروع
- **حالة الوثيقة:** مرجع تنفيذي إلزامي قبل أي تعديل متعلق بالنطاق

## 2. الملخص التنفيذي

`BombaSmart` هو اسم منظومة مكونات ذكية، وليس مكوناً منفرداً. المنظومة تضيف سلوكاً قابلاً لإعادة الاستخدام فوق مكونات الواجهة الأساسية، مع الحفاظ على الفصل بين العرض والمنطق، وإمكانية الوصول، ودعم RTL/LTR، والثيمات، وأداء التطبيق.

`AppBackground` هو طبقة خلفية بصرية عامة تعمل خلف محتوى التطبيق. تعتمد على Canvas لرسم مشهد خفيف من الأجرام المضيئة والحركة الاختيارية، وتقرأ ألوانها من CSS Variables، وتستجيب لإعدادات المستخدم و`prefers-reduced-motion` وحالة رؤية الصفحة.

الهدف من هذه الوثيقة هو تحويل المكونين من كود قابل للتعديل إلى نظام واضح العقد: مفهوم، قابل للاختبار، آمن من ناحية الأداء، ومناسب للتطوير المستمر باستخدام AI بدون كسر معمارية المشروع.

## 3. المشكلة

المشكلة ليست في وجود خلفية متحركة أو مكونات ذكية فقط، ولكن في غياب عقد تفصيلي يمنع الآتي:

1. إضافة سلوك UI جديد داخل مكون كبير بدون فصل واضح.
2. ربط المكون مباشرة بمصدر بيانات أو Router أو Toast بدون قرار معماري.
3. تجاهل RTL/LTR أو الثيم أو إمكانية الوصول.
4. تشغيل Animation مستمر رغم إخفاء الصفحة أو تفعيل reduced motion.
5. إضافة ألوان أو قياسات ثابتة داخل المكونات.
6. تغيير alias أو أسماء التصديرات بطريقة تكسر المستهلكين.
7. اعتبار نجاح build دليلاً كافياً على صحة السلوك.
8. جعل AI يعيد كتابة ملفات لا علاقة لها بالطلب.

## 4. أهداف المنتج

### 4.1 أهداف BombaSmart

- توفير مكونات ذكية بعقود Props واضحة وقابلة للتوسعة.
- توحيد حالات loading وdisabled وvalidation وkeyboard وARIA.
- فصل منطق السلوك عن التصميم قدر الإمكان.
- منع التكرار بين الشاشات والمكونات.
- الحفاظ على `@a` كنقطة استيراد مركزية.
- جعل كل مكون قابلاً للاختبار بدون Browser أو API حقيقي عندما لا تكون الحاجة لذلك.

### 4.2 أهداف AppBackground

- تقديم خلفية بصرية هادئة لا تنافس المحتوى.
- دعم `showBackground` و`backgroundMotion` من إعدادات التطبيق.
- احترام `prefers-reduced-motion`.
- إيقاف أو تقليل العمل عند عدم رؤية الصفحة.
- دعم Retina/DPR مع حد أقصى يحمي الأداء.
- اعتماد CSS Variables للألوان والشفافية.
- منع overflow أو تداخل الخلفية مع عناصر الواجهة.
- العمل في Light/Dark وRTL/LTR بدون منطق خاص بالاتجاه.

## 5. خارج النطاق

- إنشاء نظام تصميم جديد بديل عن `packages/design-system`.
- إضافة Router جديد.
- إضافة قاعدة بيانات أو API لمجرد دعم الخلفية.
- حفظ إعدادات جديدة في localStorage بدون قرار موثق.
- إضافة WebGL أو Three.js قبل وجود حاجة فعلية مثبتة.
- تحميل صور أو فيديوهات كخلفية بدون متطلبات أداء وإتاحة واضحة.
- إعادة كتابة كل مكونات UI الحالية دفعة واحدة.
- تغيير هوية B-Auth البصرية أو نظام الألوان العام بدون RFC منفصل.

## 6. مصادر الحقيقة والقواعد الملزمة

ترتيب الأولوية عند التعارض:

1. `docs/SKILLS.md`
2. `docs/AI_CONTEXT.md`
3. `docs/ARCHITECTURE.md` إن وُجد
4. `docs/DESIGN.md` إن وُجد
5. `docs/BombaSmart.md`
6. هذه الوثيقة ثم `SPECKIT.md` كإجراءات تنفيذية
7. الكود الحالي والاختبارات كحقيقة تنفيذية أخيرة عند وصف الحالة الواقعية

قواعد المشروع الحالية:

- المشروع Monorepo يحتوي `Frontend` و`Backend` و`packages`.
- Frontend: Vite 6 وReact 19 وTypeScript وTailwind CSS 4.
- State management: Zustand، مع عدم حفظ Tokens في تخزين دائم.
- الاستيرادات داخل مكونات Frontend تمر من `@a`.
- كل أيقونة خارجية تُصدّر باسم يبدأ بـ `Icon`.
- القياسات التصميمية تستخدم `em` أو `rem` أو `%`، وليس `px` داخل المكونات.
- الألوان تُدار من CSS Variables بصيغة HSL/HSLA.
- CSS Logical Properties إلزامية بدلاً من `left/right` و`padding-left/right`.
- التعليقات الجديدة بالعربية المصرية، والكود بالإنجليزية.
- لا `eval`، ولا أسرار داخل الكود، ولا localStorage للتوكنات.

## 7. المستخدمون وحالات الاستخدام

### 7.1 مستخدم التطبيق

- يفتح التطبيق ويرى خلفية هادئة بدون إزعاج.
- يوقف الخلفية من الإعدادات.
- يختار حركة كاملة أو هادئة أو مغلقة.
- يستخدم SmartInput بالماوس أو لوحة المفاتيح أو قارئ الشاشة.
- يضغط SmartButton مرة واحدة ولا يحصل على عمليات مكررة أثناء loading.

### 7.2 المطور

- يضيف SmartField أو SmartForm بدون نسخ منطق SmartInput.
- يغير Token لوني واحداً فتتغير الخلفية بدون تعديل Canvas code.
- يختبر كل حالة بمفردها.
- يعرف الملفات المسموح تعديلها والملفات التي لا يجب لمسها.

### 7.3 AI agent

- يقرأ الوثائق قبل التنفيذ.
- يحدد scope صغيراً.
- يفحص المستهلكين والـ alias قبل التعديل.
- ينفذ أقل تغيير كامل.
- يشغل الاختبارات المناسبة ويذكر ما لم يمكن التحقق منه.

## 8. تعريف BombaSmart

### 8.1 طبقات المنظومة

1. **Base UI:** مكونات العرض الأساسية وDesign tokens.
2. **Smart primitives:** `SmartInput` و`SmartButton`، وتتعامل مع سلوك واحد مركب.
3. **Smart composition:** `SmartField` و`SmartForm` مستقبلاً، وتجمع primitives بدون تكرار منطقها.
4. **Feature adapters:** ربط المكونات بحالات شاشة login أو register، بدون وضع منطق عام خاص بالميزة داخل primitive.

### 8.2 عقد المكون الذكي

كل مكون جديد يجب أن يحدد:

- المسؤولية الأساسية.
- المدخلات والـ controlled/uncontrolled behavior.
- الحالات المرئية والمنطقية.
- الأحداث التي يطلقها.
- علاقة الـ keyboard بالـ state.
- ARIA roles وlabels وdescriptions.
- التوافق مع RTL/LTR وLight/Dark.
- سياسة loading وdisabled.
- حدود الأداء والتنظيف.
- اختبارات القبول.

### 8.3 SmartInput

المتطلبات الحالية والمستهدفة:

- controlled وuncontrolled state.
- `forwardRef`.
- floating label مع placeholder غير مرئي وظيفياً.
- clear action بشروط ظهور واضحة.
- password visibility action.
- search action عند `searchable` ووجود قيمة.
- suggestions بقائمة `combobox/listbox/option`.
- keyboard navigation مع active descendant.
- validation states: `default`, `success`, `error`.
- `aria-invalid`, `aria-describedby`, `aria-errormessage` عند الحاجة.
- رسائل الحالة لا تعتمد على اللون فقط.
- anti-autofill attributes بدون كسر `autoComplete` الذي يمرره المستهلك.
- لا تُستخدم array index كمفتاح React للاقتراحات.

### 8.4 SmartButton

المتطلبات الحالية والمستهدفة:

- variants: `primary`, `secondary`, `danger`, `ghost`.
- `loading` يمنع التفاعل ويعرض حالة مفهومة.
- `disabled` يطبق semantics صحيحة.
- دعم start/end icons من نظام `Icon*`.
- اسم وصول واضح عند عدم وجود نص.
- touch target مناسب وfocus ring واضح.
- Action lock يمنع double-submit، مع تحرير القفل عند النجاح أو الفشل أو unmount حسب العقد.
- lifecycle callbacks لا تُستدعى مرتين بسبب rerender.

### 8.5 SmartField وSmartForm مستقبلاً

- SmartField يملك عقد label وdescription وerror وinput id.
- SmartForm يجمع submit state وvalidation orchestration فقط.
- validation logic قابلة للحقن ولا تكون hardcoded داخل العرض.
- لا يتم إدخال API calls داخل SmartInput أو SmartButton.
- أي integration يمر عبر feature hook أو service layer.

## 9. تعريف AppBackground

### 9.1 المسؤولية

`AppBackground` مسؤول عن رسم طبقة خلفية decorative فقط. لا يعرض معلومات مهمة، ولا يحتوي على controls، ولا يقرر navigation، ولا يدير business state.

### 9.2 المدخلات الحالية

- `showBackground` من Zustand settings.
- `backgroundMotion` بقيم منطقية مثل `off`, `calm`, `full`.
- `prefers-reduced-motion` من النظام.
- viewport size وdevice pixel ratio.
- CSS Variables مثل `--orb-a` و`--bg-orb-alpha` و`--bg-mote-alpha`.

### 9.3 السلوك

- عند الإخفاء: لا يبدأ animation loop جديداً، ويُرسم static/فارغ حسب السياسة.
- عند reduced motion: لا حركة ولا parallax، ويُعرض مشهد ثابت أو طبقة آمنة.
- عند `off`: لا توجد حركة، ويفضل عدم تشغيل أي Canvas work غير ضروري.
- عند `calm`: حركة الأجرام فقط بدون motes أو parallax القوي.
- عند `full`: حركة الأجرام وmotes وparallax إن لم يمنعها reduced motion.
- عند hidden tab: يتوقف الرسم، وعند العودة يعاد تشغيل loop مرة واحدة فقط.
- عند resize: يعاد ضبط canvas وDPR بدون تسريب listeners أو frames.

### 9.4 نموذج الرسم

- عدد الأجرام يتناسب مع العرض ضمن حد أدنى وأقصى.
- كل Orb له position وradius وspeed وphase وcolor token.
- الرسم يستخدم `clearRect` ثم radial gradients.
- الألوان من computed CSS variables، وليس من hex أو rgb ثابت.
- `globalAlpha` يعاد إلى قيمة آمنة بعد كل مرحلة رسم.
- DPR يحد إلى قيمة تمنع تضخم الذاكرة.
- لا يتم إنشاء objects ثقيلة داخل كل frame إلا عند الضرورة.

### 9.5 متطلبات DOM وCSS

- الجذر decorative ويحمل `aria-hidden="true"`.
- الخلفية خلف المحتوى ولا تمنع pointer events.
- لا تستخدم z-index عشوائياً؛ تعتمد على tokens المشروع.
- لا تسبب scrollbars.
- تحترم `prefers-reduced-motion` في CSS والـ JS معاً.
- تعتمد على logical properties.
- لا تغير layout dimensions للمحتوى.

## 10. المتطلبات غير الوظيفية

### الأداء

- لا يوجد animation loop عند `off` أو reduced motion.
- لا يوجد أكثر من requestAnimationFrame loop فعال للمكون.
- يتم cancel للـ frame عند unmount أو تغيير policy.
- يفضل throttle أو تحديث parallax عبر requestAnimationFrame إذا أصبح pointermove مكلفاً.
- لا تعاد قراءة computed styles أكثر من اللازم داخل frame؛ يمكن caching مع invalidation عند theme change.
- لا يتجاوز Canvas ذاكرة مناسبة للأجهزة منخفضة الإمكانيات.

### الإتاحة

- الخلفية decorative ولا تُعلن لقارئ الشاشة.
- المحتوى فوقها يحتفظ بتباين WCAG AA.
- الحركة لا تكون الوسيلة الوحيدة لفهم حالة.
- كل أزرار BombaSmart لها accessible name وfocus واضح.
- keyboard behavior موثق ومختبر.

### الأمان

- لا يتم تنفيذ strings ككود.
- لا يتم تحميل script أو asset من مصدر خارجي بدون قرار.
- لا تُقرأ أسرار أو Tokens من المكونات.
- مدخلات المستخدم في SmartInput لا تُستخدم في HTML غير آمن.

### قابلية الصيانة

- لا تدمج AppBackground مع SmartInput أو SmartButton في ملف واحد.
- دوال الرسم pure قدر الإمكان وتُختبر بمدخلات واضحة.
- types محلية أو مشتركة حسب نطاقها.
- أي تصدير جديد يمر عبر alias المركزي.

## 11. المتطلبات الوظيفية التفصيلية

| المعرّف | المتطلب | الأولوية | معيار القبول |
|---|---|---:|---|
| BG-001 | إخفاء الخلفية | عالية | لا يظهر المشهد ولا يوجد loop فعال |
| BG-002 | motion off | عالية | canvas ثابت أو غير مستخدم حسب السياسة، بلا حركة |
| BG-003 | reduced motion | عالية | لا parallax ولا animation |
| BG-004 | calm mode | عالية | حركة أجرام فقط، بدون motes |
| BG-005 | full mode | متوسطة | الأجرام والموتس والـ parallax تعمل |
| BG-006 | visibility handling | عالية | يتوقف عند hidden ويستأنف مرة واحدة |
| BG-007 | resize | عالية | لا تشوه ولا overflow ولا leak |
| BG-008 | theme tokens | عالية | الألوان تتغير من CSS variables |
| BS-001 | SmartInput validation | عالية | الحالة والرسالة وARIA متطابقة |
| BS-002 | SmartInput suggestions | عالية | combobox keyboard flow يعمل |
| BS-003 | SmartButton loading | عالية | لا double-submit أثناء loading |
| BS-004 | alias compliance | عالية | لا imports ممنوعة |
| BS-005 | RTL/LTR | عالية | لا انحراف أو ترتيب مكسور |

## 12. استراتيجية الاختبار

### Unit

- اختبار `clampDpr` بمدخلات 0 و1 و2 وأعلى من 2.
- اختبار اختيار عدد الأجرام حسب width.
- اختبار static drawing لا ينتج motion values.
- اختبار SmartButton lock lifecycle.
- اختبار SmartInput derived states وkeyboard transitions.

### Component

- mount/unmount بدون console errors.
- toggling `showBackground` لا يترك animation loop.
- تبديل motion policy يعيد تهيئة الموارد مرة واحدة.
- `prefers-reduced-motion` يتغير أثناء التشغيل.
- SmartInput يعرض الرسائل ويربط ids بشكل صحيح.
- SmartButton ينادي handler مرة واحدة.

### Browser

- desktop وmobile viewport.
- Light/Dark وRTL/LTR.
- Console errors فارغة.
- لا scrollbars غير مقصودة.
- keyboard flow كامل.
- screenshot عند الحاجة لتوثيق الشكل.

### Quality gates

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- مراجعة diff و`git diff --check`

## 13. Definition of Done

- العقد موثق ومطبق.
- السلوك المطلوب مغطى باختبار مناسب.
- لا يوجد import مخالف لـ `@a`.
- لا توجد قياسات أو ألوان مخالفة.
- لا يوجد animation leak أو double-submit.
- تم فحص reduced motion وvisibility وresize.
- تم فحص RTL/LTR وLight/Dark.
- كل الفحوص المطلوبة تمر، أو يتم ذكر الفحص المتعذر بوضوح.
- تم تحديث `docs/AI_SESSION.md` و`docs/CHANGELOG.md` و`docs/DEVELOPMENTS.md` عند تنفيذ تغييرات فعلية.
- لا يتم إعلان بند كمكتمل بناءً على قراءة الكود فقط.

## 14. مخاطر وقرارات مفتوحة

- Canvas قد يستهلك موارد على أجهزة ضعيفة؛ يلزم profile قبل زيادة عدد الأجرام.
- قراءة CSS variables داخل كل frame قد تكون مكلفة؛ caching خيار تحسين لاحق.
- بعض متصفحات Safari قد تتعامل بشكل مختلف مع Canvas DPR؛ يلزم اختبار فعلي.
- anti-autofill قد يؤثر على password managers؛ يجب احترام القيم الصريحة للمستهلك.
- أي تغيير في settings persistence يحتاج قراراً منفصلاً ولا يضاف ضمن مكون العرض.

## 15. سياسة التطوير المستقبلي

أي تغيير جديد يجب أن يحدد أولاً هل هو:

1. إصلاح bug.
2. إضافة behavior عام إلى BombaSmart.
3. إضافة feature adapter لشاشة محددة.
4. تحسين أداء AppBackground.
5. تعديل design token.
6. تغيير معماري يحتاج RFC.

إذا كان التغيير يغير API العامة أو state contract أو طريقة التخزين أو يضيف dependency، فلا يُنفذ مباشرة قبل تحديث هذه الوثيقة وكتابة قرار واضح في سجل المشروع.

---

## ملحق: خريطة الملفات المتوقعة

```text
Frontend/src/
├── alias/index.ts
├── components/
│   ├── app-background.tsx
│   └── ui/
│       ├── smart-input.tsx
│       └── smart-button.tsx
├── hooks/
├── lib/
├── screens/
└── styles/

docs/
├── BombaSmart.md
├── AI_CONTEXT.md
├── AI_SESSION.md
├── CHANGELOG.md
├── DEVELOPMENTS.md
├── SKILLS.md
└── TODO.md

PRD.md
SPECKIT.md
```

هذه الخريطة وصفية وليست تصريحاً بإنشاء ملفات جديدة بدون حاجة فعلية.
