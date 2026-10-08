# SPECKIT — بروتوكول تنفيذ وتحديث BombaSmart

## 1. الغرض

هذا الملف هو بروتوكول عملي يستخدمه الـ AI عند تطوير أو تحديث `BombaSmart` أو `AppBackground` أو أي مكون Frontend مرتبط بهما. لا يبدل قواعد المشروع، بل يحولها إلى خطوات تنفيذ قابلة للمراجعة.

القاعدة الأساسية: اقرأ، افهم، خطط، عدّل أقل نطاق ممكن، اختبر، راجع، ثم وثّق.

## 2. بوابة البداية الإلزامية

قبل لمس أي ملف، نفذ الآتي:

1. اقرأ `docs/AI_CONTEXT.md`.
2. اقرأ `docs/AI_SESSION.md`.
3. اقرأ `docs/TODO.md`.
4. اقرأ `docs/SKILLS.md`.
5. اقرأ `docs/BombaSmart.md`.
6. اقرأ `PRD.md` و`SPECKIT.md`.
7. افحص حالة Git والفرع الحالي.
8. ابحث عن كل مستهلك للمكون أو الدالة التي ستتغير.
9. افحص `Frontend/src/alias/index.ts` قبل إضافة أي import أو export.
10. حدد معيار نجاح يمكن إثباته باختبار أو Browser check.

لا تبدأ التنفيذ إذا كان هناك تعارض معماري واضح أو requirement لا يمكن اختياره بأمان. في هذه الحالة اذكر التعارض واسأل سؤالاً واحداً مركزاً مع default مقترح.

## 3. قواعد اللغة والكود

- التواصل والوثائق والتعليقات بالعربية المصرية الواضحة.
- أسماء المتغيرات والدوال والأنواع والكود بالإنجليزية.
- لا تستخدم Emoji داخل الملفات إلا إذا طلب المستخدم ذلك.
- لا تستخدم `any`.
- استخدم `unknown` مع narrowing عند الحاجة.
- استخدم `export type` و`import type` للأنواع.
- لا تكتب تعليقات تشرح ما يفعله السطر؛ اكتب تعليقاً فقط لشرح سبب غير واضح.
- لا تكتب secrets أو Tokens أو بيانات إنتاج.
- لا تستخدم `eval`.

## 4. قواعد الاستيراد والـ alias

داخل `Frontend/src`:

- الاستيراد من `@a` هو القاعدة.
- ممنوع الاستيراد المباشر من `react` أو `react-redux` أو `lucide-react` أو UI modules داخل الصفحات والمكونات والـ hooks.
- أي icon جديد يجب تصديره باسم `Icon...` في alias قبل استخدامه.
- أي component أو hook جديد يجب تصديره من alias إذا كان سيُستخدم خارج ملفه.
- لا تستخدم مسارات نسبية عميقة مثل `../../`.
- لا تعدل alias بلا فحص circular dependency.

استثناءات مسموحة فقط في ملفات alias أو configuration أو store الرئيسي حسب قواعد المشروع.

## 5. بروتوكول تحليل المهمة

قبل التنفيذ اكتب داخلياً أو في work log:

```text
Current status: ما الموجود فعلاً
Target: السلوك المطلوب
Scope: الملفات المسموح تعديلها
Dependencies: ما يعتمد على التغيير
Risks: أخطر احتمال كسر
Validation: كيف سأثبت النجاح
```

صنف الطلب:

- `bug-fix`: إصلاح بدون تغيير API إن أمكن.
- `behavior`: سلوك عام في BombaSmart.
- `feature-adapter`: ربط بشاشة أو feature محددة.
- `performance`: تقليل render أو canvas work.
- `accessibility`: ARIA أو keyboard أو focus.
- `design-token`: تعديل في tokens أو theme.
- `architecture`: dependency أو persistence أو routing أو state contract.

لو التصنيف `architecture`، لا تنفذ مباشرة قبل توثيق القرار في PRD وتحديد أثره.

## 6. بروتوكول AppBackground

### 6.1 قبل التعديل

افحص:

- مصدر `showBackground` و`backgroundMotion`.
- كل CSS variables المستخدمة في الرسم.
- موضع تركيب `AppBackground` في layout.
- قواعد `pointer-events`, `position`, `z-index`, وoverflow.
- هل هناك أكثر من نسخة mounted؟
- هل يوجد test أو screenshot قائم؟

### 6.2 قواعد lifecycle

كل `useEffect` مسؤول عن مجموعة موارد واضحة:

- event listeners.
- animation frame.
- media query listener.
- pointer listener.

لكل resource cleanup متناظر في return.

لا تستخدم anonymous listener عند الحاجة لإزالته لاحقاً. احتفظ بمرجع الدالة.

لا تسمح بأكثر من loop واحد. قبل تشغيل loop جديد:

1. ألغِ القديم.
2. صفّر frame id.
3. أعد تهيئة context state إذا لزم.
4. شغل loop الجديد مرة واحدة.

عند `document.visibilityState === 'hidden'`:

- لا تستمر في requestAnimationFrame.
- عند العودة، استأنف من نقطة واضحة بدون إنشاء listener جديد.

عند unmount:

- cancelAnimationFrame.
- remove resize listener.
- remove visibility listener.
- remove pointer listener.
- remove media listener.
- لا تترك canvas context أو references تمنع garbage collection.

### 6.3 سياسة motion

طبّق الأولوية التالية:

```text
OS reduced motion
  > user backgroundMotion = off
  > user backgroundMotion = calm
  > user backgroundMotion = full
```

- `off`: لا حركة ولا parallax ولا motes.
- reduced motion: تعامل كـ off أو static آمن.
- `calm`: الأجرام فقط، حركة منخفضة، بدون decorative motes.
- `full`: كل المؤثرات المسموحة، لكن مع حدود الأداء.

لا تعتبر CSS `prefers-reduced-motion` وحدها كافية؛ منطق Canvas يحتاج القرار نفسه.

### 6.4 سياسة Canvas

- حد DPR إلى قيمة معقولة.
- استخدم `setTransform` بعد resize.
- لا تعتمد على CSS width وحده لحساب الرسم.
- امسح frame السابق قبل الرسم.
- أعد `globalAlpha`, `globalCompositeOperation`, و`fillStyle` عند تغيير مراحل الرسم.
- لا تقرأ computed style لكل Orb إذا يمكن قراءته مرة واحدة لكل frame أو عند تغير theme.
- لا تنشئ gradients أو arrays غير ضرورية داخل loop.
- لا تستخدم ألواناً ثابتة داخل TypeScript.
- لا تجعل المشهد ضرورياً لفهم أي وظيفة.

### 6.5 سياسة parallax

- يعمل فقط في `full`.
- يتوقف مع reduced motion أو off أو calm.
- يجب ألا يسبب layout shift.
- يفضل تحديث الحالة بمعدل محدود إذا أظهر profiling renders كثيرة.
- لا تربط pointermove بعناصر interactive بطريقة تمنع clicks.

## 7. بروتوكول BombaSmart

### 7.1 قبل إنشاء مكون جديد

أجب عن الأسئلة التالية:

1. لماذا لا يكفي component موجود؟
2. هل السلوك عام أم خاص بشاشة؟
3. ما الحالات الأساسية؟
4. ما عقد controlled/uncontrolled؟
5. ما public props الضرورية فقط؟
6. ما keyboard model؟
7. ما ARIA model؟
8. كيف يعمل RTL/LTR؟
9. ماذا يحدث أثناء loading أو error؟
10. كيف يمكن اختباره بدون API؟

إذا كان السلوك خاصاً بشاشة واحدة، أنشئ adapter أو hook في feature بدلاً من تضخيم Smart primitive.

### 7.2 عقد Props

كل prop يجب أن يكون واحداً من:

- data input.
- visual variant.
- state control.
- callback.
- accessibility override.
- integration injection.

تجنب props الغامضة مثل `magic`, `advanced`, `doEverything`.

الأسماء المنطقية تبدأ بـ `is`, `has`, `can`, أو `should` عند كونها Boolean.

### 7.3 controlled وuncontrolled

- لو `value` موجود، لا تدير قيمة مستقلة تنافسه.
- لو `defaultValue` موجود فقط، أدِر internal state.
- callbacks يجب أن تعكس القيمة الفعلية.
- لا تستخدم `useEffect` لتكرار derived state يمكن حسابه مباشرة.
- أي sync بين controlled prop وinternal state يجب أن يكون موثقاً ومختبراً.

### 7.4 validation وARIA

عند إضافة حالة validation:

- عرّف state values صراحة.
- اربط message بعنصر input عبر id ثابت.
- استخدم `aria-invalid` فقط عند الخطأ.
- استخدم `aria-describedby` للوصف أو الرسالة.
- استخدم `aria-live` للإعلان عن التغيرات غير المتوقعة فقط.
- لا تعتمد على اللون وحده.
- icon الحالة decorative إذا كانت الرسالة النصية موجودة، وإلا يجب أن تكون مفهومة.

### 7.5 suggestions وkeyboard

لـ combobox:

- input يحمل role الصحيح.
- القائمة `role="listbox"`.
- كل نتيجة `role="option"`.
- active option لها id ثابت.
- استخدم suggestion id كمفتاح.
- الأسهم تغير active item.
- Enter يختار فقط عندما توجد نتيجة active.
- Escape يغلق القائمة بدون مسح القيمة إلا لو العقد يقول ذلك.
- Tab يغلق ويكمل focus flow.
- راعِ CJK composition؛ لا تعتبر Enter submit أثناء composition أو عند `keyCode === 229`.

### 7.6 SmartButton وActionLock

- handler لا يعمل أثناء disabled أو loading.
- lock يملك owner واضحاً.
- لا تستخدم global lock بدون namespace.
- حرر القفل في success وfailure وunmount حسب الحاجة.
- لا تمنع keyboard activation الصحيحة.
- زر icon-only يحتاج accessible name.
- `aria-busy` عند loading إذا كان مناسباً.
- لا تغير النص بطريقة تسبب layout shift كبيراً إن أمكن.

## 8. قواعد التصميم

- استخدم tokens الحالية، لا تضف لوناً داخل component.
- HSL/HSLA فقط للألوان.
- em/rem/% للقياسات.
- logical properties للاتجاه.
- لا تستخدم `dark:` إذا كان النظام يعتمد CSS variables.
- الحركة قصيرة وذات غرض، واحترم reduced motion.
- focus ring لا يُخفى بدون بديل واضح.
- الخلفية decorative لا تزيد contrast noise خلف النص.

## 9. قواعد تعديل الملفات

- عدّل أقل عدد ملفات يحقق المطلوب.
- لا تعيد تنسيق ملفات غير مرتبطة.
- لا تحذف import قبل حذف الاستخدام؛ احذف الاستخدام أولاً ثم import إذا صار غير مستخدم.
- لا تنشئ duplicate component لأن الاسم مشابه.
- لا تغيّر public API بدون تحديث كل callers والوثائق.
- لا تنشئ README أو docs إضافية غير مطلوبة؛ هذه الوثيقة وPRD هما الوثيقتان المطلوبتان لهذا النطاق.
- استخدم Edit للتعديلات الدقيقة وWrite فقط للملفات الجديدة أو إعادة البناء المقصودة.

## 10. خطة تنفيذ قياسية

### المرحلة 1: فهم

- اقرأ الوثائق.
- اقرأ الملف المستهدف بالكامل.
- ابحث عن callers وimports وstyles وtests.
- سجل assumptions والمخاطر.

### المرحلة 2: عقد

- اكتب أو حدّث types.
- حدد behavior matrix.
- حدد acceptance criteria.
- حدد الملفات المسموح تعديلها.

### المرحلة 3: تنفيذ صغير

- نفذ logic قبل polish.
- حافظ على public API قدر الإمكان.
- أضف alias exports عند الحاجة.
- لا تدخل integration غير مطلوبة.

### المرحلة 4: تحقق ضيق

- شغل typecheck أو test الأقرب للتغيير.
- اقرأ الأخطاء وعدّل السبب لا العرض.
- افحص diff.

### المرحلة 5: تحقق شامل

- شغل lint وtest وbuild عند توفرها.
- استخدم Browser verification لأي UI مرئي أو تفاعلي.
- راجع console errors وARIA وresponsive.

### المرحلة 6: توثيق وتسليم

- حدّث ملفات الاستمرارية المطلوبة عند وجود تغيير فعلي.
- اذكر الملفات، السلوك، الفحوص، وأي caveat.
- نفذ SyncGit بعد آخر تعديل وقبل إنهاء المهمة.

## 11. مصفوفة اختبار AppBackground

| الحالة | expected |
|---|---|
| showBackground=true, full | scene visible and animated |
| showBackground=true, calm | orb motion only |
| showBackground=true, off | static/no motion |
| showBackground=false | hidden and no active loop |
| reduced motion=true | no motion/parallax |
| tab hidden | frame loop paused |
| tab visible again | one loop resumed |
| resize | canvas dimensions and transform updated |
| theme change | token colors reflected |
| unmount | listeners and frames cleaned |
| narrow viewport | no horizontal overflow |

## 12. مصفوفة اختبار SmartInput وSmartButton

| الحالة | SmartInput | SmartButton |
|---|---|---|
| empty | label/placeholder صحيحان | النص أو aria-label موجود |
| filled | clear/search rules صحيحة | icon/text لا يسببان كسر layout |
| focus | focus ring وfloating label | focus ring واضح |
| error | message + ARIA | لا يعرض error بصرياً فقط |
| disabled | لا keyboard mutation | لا handler |
| loading | غير مطبق إلا بعقد | لا double-submit |
| password | visibility action | غير مطبق |
| suggestions | combobox flow | غير مطبق |
| RTL | ترتيب منطقي | icon placement منطقي |
| reduced motion | transitions آمنة | لا animation مزعج |

## 13. معايير رفض التغيير

ارفض أو أوقف التغيير إذا وجد أحد الآتي:

- import مباشر مخالف بدون سبب مسموح.
- `localStorage` للتوكن أو session.
- `eval` أو تنفيذ string ككود.
- لون أو قياس ثابت يخالف design system.
- animation loop بلا cleanup.
- component عام يحتوي API خاصاً بميزة واحدة.
- double-submit محتمل.
- ARIA غير متسق مع DOM behavior.
- test/build يفشل وتم تجاهل الخطأ.
- docs تعلن نجاحاً غير مثبت.
- تغيير dependency أو architecture بدون قرار.

## 14. قالب خطة مهمة للـ AI

استخدم القالب التالي داخل work log أو خطة التنفيذ:

```markdown
## المهمة
[وصف قصير]

## Current status
[الحالة الواقعية بعد القراءة]

## الهدف
[السلوك الذي يجب أن يتحقق]

## النطاق
- [ملف مسموح]
- [ملف مسموح]

## خارج النطاق
- [شيء لا يجب تغييره]

## العقد
- Props:
- State:
- Events:
- Accessibility:

## المخاطر
- [خطر]

## التنفيذ
1. [خطوة]
2. [خطوة]

## التحقق
- [ ] typecheck
- [ ] lint
- [ ] test
- [ ] build
- [ ] browser

## Definition of Done
- [ ] [معيار قابل للإثبات]
```

## 15. قالب مراجعة قبل التسليم

```markdown
### Code review
- [ ] التغيير أصغر نطاق ممكن
- [ ] لا imports مخالفة
- [ ] لا any أو eval
- [ ] cleanup كامل للـ effects
- [ ] state contract واضح
- [ ] keyboard وARIA مراجعان
- [ ] RTL/LTR مراجعان
- [ ] Light/Dark مراجعان
- [ ] reduced motion مراجع
- [ ] no overflow

### Verification
- [ ] typecheck
- [ ] lint
- [ ] test
- [ ] build
- [ ] browser console
- [ ] screenshot عند الحاجة

### Documentation
- [ ] PRD محدث لو العقد تغير
- [ ] BombaSmart docs محدثة
- [ ] AI_SESSION محدث
- [ ] CHANGELOG محدث
- [ ] DEVELOPMENTS محدث
```

## 16. بروتوكول التعامل مع الفشل

- لو فشل typecheck: أصلح النوع أو العقد، ولا تستخدم cast لإخفاء المشكلة.
- لو فشل lint: أصلح السبب، ولا تعطل القاعدة بلا قرار.
- لو فشل test: افحص هل الكود أم الاختبار أصبح قديماً، ثم حدّث الاختبار فقط إذا تغير العقد المقصود.
- لو فشل build بسبب dependency: افحص manifest والlockfile، ولا تضف مكتبة بديلة عشوائياً.
- لو فشل Browser بسبب preview: افحص logs والـ snapshot والـ console، ثم أبلغ عن routing blocker إن استمر.
- لو كان sandbox غير متاح بعد محاولة استعادة واحدة: توقف وأبلغ عن التحقق غير المكتمل.

## 17. بروتوكول Git

- لا تعمل commit قبل آخر تعديل والتحقق.
- استخدم branch الحالي المخصص للعمل، ولا تدفع مباشرة إلى base branch.
- رسالة commit بالعربية المصرية وبالصيغة المعتمدة للمشروع.
- نفذ `SyncGit` مرة واحدة بعد اكتمال كل تغييرات المهمة.
- لا تدّعي أن التغيير pushed إذا فشلت المزامنة.

## 18. النتيجة المطلوبة من أي AI agent

في نهاية المهمة يجب أن يجيب باختصار:

1. ماذا تغير؟
2. ما الملفات التي تغيرت؟
3. ما الاختبارات التي مرت؟
4. ما الفحص الذي لم يمر أو لم يمكن تشغيله؟
5. ما المخاطر أو الخطوة التالية؟

ممنوع الرد بعبارة عامة مثل “تم الإصلاح” بدون ذكر دليل تحقق.

## 19. العلاقة بين PRD وSPECKIT

- `PRD.md` يشرح لماذا نبني النظام، وما المطلوب، وما حدود المنتج.
- `SPECKIT.md` يشرح كيف ينفذ AI التغيير بأمان داخل هذا المشروع.
- `docs/BombaSmart.md` يسجل الحالة التشغيلية المختصرة للمكونات الحالية.
- `docs/SKILLS.md` هو مرجع القواعد الفعلي للمشروع.

عند تغيير السلوك العام أو العقد: حدّث `PRD.md`.
عند تغيير طريقة التنفيذ أو بوابات المراجعة: حدّث `SPECKIT.md`.
عند تنفيذ milestone فعلي: حدّث ملفات الاستمرارية وسجل الحالة الواقعية في `docs/BombaSmart.md` عند الحاجة.

## 20. أولويات التطوير المقترحة

1. تثبيت اختبارات lifecycle لـ AppBackground.
2. فصل دوال حساب المشهد عن React effects إن لم يكسر ذلك العقد.
3. تحسين caching لـ CSS variables عند الحاجة بعد profiling.
4. إضافة اختبارات keyboard وARIA لـ SmartInput.
5. إضافة اختبار double-submit وActionLock لـ SmartButton.
6. إضافة SmartField بعد تثبيت contracts الحالية.
7. إضافة SmartForm فقط بعد وجود use case فعلي.

لا تُنفذ الأولويات تلقائياً لمجرد وجودها هنا؛ كل milestone يحتاج scope وacceptance criteria وتحقق مستقل.

---

**قاعدة النهاية:** لا تجعل AI يكتب أكثر مما يفهم. الفهم يبدأ من الوثائق، والصحة تثبتها الاختبارات، والاستمرارية يحفظها التوثيق.
