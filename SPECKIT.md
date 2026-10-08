# SPECKIT — بروتوكول تنفيذ BombaSmart و AppBackground

## 1. الغرض

الملف ده بيشرح للـ AI والمطور **إزاي** يطبقوا `PRD.md` داخل أي مشروع، مع احترام معمارية المشروع المضيف، قواعد الكتابة، نظام الملفات، المهارات، الأدوات، والـ quality gates الموجودة فعلاً.

`PRD.md` يحدد المطلوب من المنتج. الملف ده يحدد طريقة التنفيذ الآمن والقابل للمراجعة.

---

## 2. قاعدة الأولوية

عند أي تعارض، استخدم الترتيب التالي:

1. تعليمات المستخدم الصريحة.
2. قواعد النظام أو المنصة.
3. وثائق المشروع المضيف: skills, architecture, design, agents, context.
4. قرارات موثقة خاصة بالمشروع.
5. `PRD.md`.
6. `SPECKIT.md`.
7. conventions المستنتجة من الكود.
8. default عام معقول.

لو التعارض مؤثر ومفيش default آمن، توقف واسأل سؤال واحد مركز، مع اقتراح default.

---

## 3. بوابة القراءة قبل التنفيذ

قبل تعديل أي ملف:

- اقرأ active plan.
- اقرأ source of truth للمشروع.
- اقرأ آخر session وTODO وchangelog لو موجودين.
- اقرأ PRD وSPECKIT.
- افحص manifest وlockfile قبل dependencies.
- افحص الفرع وحالة Git.
- اقرأ الملف المستهدف بالكامل.
- ابحث عن كل callers وexports والـ styles والاختبارات.
- افحص الـ alias المركزي أو import convention.

ممنوع تبدأ من اسم الملف فقط؛ لازم تتأكد إنه variant الحي والمستخدم فعلاً.

---

## 4. سجل التحليل الإلزامي

قبل الكود، جهّز سجل بالشكل ده:

```text
Current status: الواقع الحالي بعد القراءة
Task type: bug-fix | behavior | feature | performance | accessibility | architecture
Target behavior: النتيجة المطلوبة
Allowed scope: الملفات المسموح تعديلها
Consumers: كل المستهلكين المتأثرين
Dependencies: integrations أو packages أو tokens
Risks: احتمالات الكسر
Validation: الدليل اللي هيثبت النجاح
Assumptions: الافتراضات القابلة للعكس
```

لو السجل فيه assumption معماري كبير، لا تنفذه بصمت.

---

## 5. قواعد الكتابة والتسمية

- لغة التواصل والوثائق والتعليقات حسب قواعد المشروع المضيف.
- الكود يتبع naming convention الخاص بالمشروع.
- استخدم types صريحة.
- تجنب `any`؛ استخدم `unknown` مع narrowing.
- استخدم `export type` و`import type` لما يفرضه المشروع.
- التعليق يشرح السبب، مش السطر الواضح.
- لا secrets أو tokens داخل الملفات.
- لا `eval` ولا dynamic code execution.
- لا تنشئ documentation جديدة غير مطلوبة.
- لا تعمل broad formatting أو refactor خارج scope.

لو المشروع المرفق يفرض العربية المصرية للتوثيق، التزم بها. لو مشروع تاني عنده convention مختلف، وثّق adaptation ولا تفرض قواعد BomBa بدون سبب.

---

## 6. قواعد المعمارية

### طبقات عامة

```text
Tokens / Base UI
  → Smart Primitive
    → Feature Hook / Adapter
      → Screen / Page / Workflow
```

### ممنوعات

- primitive يستدعي API.
- primitive يعرف route أو business event خاص بشاشة.
- feature adapter يعيد نسخ markup الأساسي.
- UI component يصل مباشرة لdatabase.
- AppBackground يدير business state.
- background renderer يعتمد على DOM structure غير مضمون.
- component يغير persistence contract من نفسه.

### الاستثناءات

أي استثناء لازم يكتب السبب، النطاق، وخطة إزالته لو كان مؤقتاً.

---

## 7. بروتوكول imports والملفات

اتبع convention المشروع المضيف حرفياً.

لو عنده alias مركزي:

- استخدمه داخل الصفحات والمكونات والـ hooks حسب القاعدة.
- أضف export قبل أول استخدام.
- افحص circular dependencies.
- التزم بتسمية الأيقونات المقررة.

لو مفيش alias:

- استخدم أقرب import convention رسمي.
- لا تنقل مكونات لمجلدات جديدة لمجرد التنظيم.
- لا تضف abstraction للـ imports من غير احتياج.

عند حذف كود: احذف الاستخدام أولاً، ثم imports غير المستخدمة.

---

## 8. بروتوكول BombaSmart

### 8.1 قبل إنشاء Smart Component

جاوب:

1. هل السلوك عام فعلاً؟
2. هل component موجود يقدر يغطيه؟
3. هل السلوك خاص بشاشة واحدة؟ لو آه، استخدم adapter.
4. إيه أقل public props؟
5. هل state controlled ولا uncontrolled؟
6. إيه keyboard behavior؟
7. إيه accessible name وrelationships؟
8. إيه سلوك loading/disabled/error؟
9. إزاي نختبره بدون network؟
10. هل يحتاج export مركزي أو test fixture؟

### 8.2 عقد props

كل prop لازم يندرج تحت تصنيف واضح:

- input data
- visual option
- controlled state
- callback
- accessibility override
- injected behavior

ممنوع prop يجمع أكتر من مسؤولية.

### 8.3 controlled/uncontrolled

- controlled value لا يتنافس مع internal value.
- default value لا يتغير تلقائياً بعد mount إلا بعقد واضح.
- callbacks تكون stable enough حسب حاجة المشروع.
- derived values تتحسب من المصدر الحالي.
- لا تستخدم effect لإصلاح state كان ممكن يتحسب مباشرة.

### 8.4 keyboard وIME

في inputs والـ forms:

- لا submit أثناء `event.nativeEvent.isComposing`.
- اعتبر `keyCode === 229` composition في Safari Desktop.
- Enter/Space لازم يعملوا حسب native semantics.
- Escape لا يمسح القيمة إلا لو العقد بيقول كده.
- Tab يحافظ على focus order الطبيعي.

### 8.5 validation وARIA

- اربط error وdescription بـ ids.
- `aria-invalid` للخطأ فقط.
- `aria-describedby` للوصف أو الرسالة.
- `aria-live` للتغيرات التي تحتاج إعلان فقط.
- لا تعتمد على color-only state.
- icon decorative لو النص كافي.

### 8.6 Action locking

لو component ينفذ async action:

- استخدم lock manager مستقل، مش global state داخل component.
- lock key واضح ومحدود.
- سياسة التعارض الافتراضية `drop` إلا لو المشروع قرر غير ذلك.
- ownership token يمنع release من caller غلط.
- `finally` مسؤول عن cleanup.
- لا تربط lock تلقائياً بـ Toast أو Router أو Query.
- اختبر success وfailure وthrow وunmount وdouble click.

---

## 9. بروتوكول AppBackground

### 9.1 فحص ما قبل التنفيذ

حدد:

- أين يتم mount؟
- هل فيه أكثر من instance؟
- مصدر enabled state وmotion policy.
- CSS variables وtheme source.
- z-index وpointer-events.
- overflow behavior.
- هل renderer Canvas أو CSS أو SVG أو WebGL؟
- هل توجد اختبارات أو screenshots؟

### 9.2 motion precedence

استخدم الترتيب:

```text
OS reduced motion
  > user disabled motion
  > calm policy
  > full policy
```

لو المشروع عنده ترتيب مختلف موثق، اتبعه.

### 9.3 lifecycle

كل resource لازم له owner وcleanup:

- animation frame → cancelAnimationFrame
- resize listener → removeEventListener
- visibility listener → removeEventListener
- media query listener → remove listener بالطريقة المدعومة
- pointer listener → removeEventListener

ممنوع تشغيل loop جديد قبل إلغاء القديم. ممنوع anonymous callbacks لو محتاج تشيلها.

### 9.4 visibility

عند hidden:

- وقف الرسم.
- لا تعمل busy loop.
- حافظ على state الضروري فقط.

عند visible:

- استأنف loop واحد.
- لا تضاعف listeners.
- لو policy اتغيرت أثناء hidden، طبّق آخر policy فقط.

### 9.5 Canvas

- قِس CSS viewport.
- اضبط backing store حسب DPR محدود.
- استخدم `setTransform` بعد resize.
- اعمل clear قبل الرسم.
- رجّع `globalAlpha` وcomposition state.
- cache tokens خارج hot path مع invalidation عند theme change.
- لا تعتمد على hex/rgb hardcoded لو المشروع يفرض tokens.
- ما تخليش Canvas ضروري لفهم أو تنفيذ الوظيفة.

### 9.6 renderer بديل

لو Canvas مش مناسب:

1. أثبت السبب بالأداء أو التوافق.
2. قارن CSS/SVG/WebGL.
3. اختار أخف renderer يحقق المطلوب.
4. حدّث PRD وقرار المعمارية.
5. نفذ proof صغير قبل broad rewrite.

---

## 10. التصميم والـ responsive

اتبع design system الخاص بالمشروع:

- tokens بدل values عشوائية.
- وحدات القياس المعتمدة.
- HSL/HSLA أو النظام المحدد في المشروع.
- logical properties لـ RTL/LTR.
- لا تغيّر theme contract داخل component.
- لا تستخدم animation للزخرفة فقط.
- focus ring ظاهر.
- background لا يقلل contrast.

اختبر على أضيق viewport مدعوم، مش desktop فقط.

---

## 11. خطة التنفيذ القياسية

### المرحلة 1 — فهم

- قراءة docs والكود والمستهلكين.
- تحديد scope وacceptance criteria.
- إنشاء قائمة الملفات المسموح تعديلها.

### المرحلة 2 — العقد

- تحديث types أو interfaces.
- تعريف behavior matrix.
- تعريف errors وedge cases.
- تحديث PRD لو العقد اتغير.

### المرحلة 3 — logic

- افصل pure helpers عن React effects.
- نفذ lifecycle بأقل موارد.
- حافظ على public API.

### المرحلة 4 — integration

- اربط adapter أو screen فقط.
- لا تعيد كتابة شاشات غير مطلوبة.
- حدّث exports عند الحاجة.

### المرحلة 5 — التحقق الضيق

- typecheck أو أقرب test.
- إصلاح السبب الحقيقي.
- فحص diff.

### المرحلة 6 — التحقق المرئي

لأي UI:

- افتح preview/browser.
- snapshot قبل interaction.
- جرّب الفلو المتأثر.
- راجع console/errors.
- خذ screenshot لو layout أو responsive متأثر.

### المرحلة 7 — التحقق الشامل

شغل الأوامر المتاحة في المشروع:

- typecheck
- lint
- unit/integration tests
- build
- browser check
- `git diff --check`

### المرحلة 8 — التوثيق والتسليم

- حدّث session/changelog/developments لو المشروع يطلب.
- اذكر ما تم وما لم يتم.
- نفذ Git sync بعد آخر تعديل.

---

## 12. مصفوفة الاختبار

### AppBackground

| الحالة | الدليل |
|---|---|
| enabled/full | المشهد ظاهر والحركة شغالة |
| calm | حركة منخفضة فقط |
| off | لا loop فعال |
| reduced motion | لا حركة/parallax |
| hidden tab | loop متوقف |
| visible again | loop واحد رجع |
| resize | dimensions وtransform صح |
| theme change | tokens اتعكست |
| unmount | لا listeners أو frames |
| small viewport | لا overflow |

### Smart components

| الحالة | الدليل |
|---|---|
| empty | label/name واضح |
| filled | القيمة سليمة |
| focus | ring وkeyboard صحيحين |
| error | message + ARIA |
| disabled | لا mutation أو handler |
| loading | state واضحة ولا double submit |
| async failure | cleanup وerror callback |
| RTL/LTR | placement وdirection صحيحين |
| reduced motion | transitions آمنة |

---

## 13. معايير رفض التغيير

أوقف التنفيذ أو اطلب قراراً لو التغيير:

- بيكسر import convention.
- بيضيف dependency بدون manifest/lockfile review.
- بيستخدم `any`, `eval`, أو secret.
- بيشغل animation بلا cleanup.
- بيخلط API مع primitive.
- بيحفظ بيانات بطريقة غير معتمدة.
- بيغير public API بدون migration.
- بيعلن test ناجح بدون تشغيله.
- بيحتاج إعادة كتابة واسعة عشان يصلح bug صغير.

---

## 14. قالب خطة AI

```markdown
## المهمة

## Current status

## المطلوب

## نوع المهمة

## الملفات المسموح تعديلها

## الملفات خارج النطاق

## العقد
- Inputs:
- State:
- Events:
- Accessibility:
- Cleanup:

## المخاطر

## خطة التنفيذ
1.
2.
3.

## التحقق
- [ ] typecheck
- [ ] lint
- [ ] test
- [ ] build
- [ ] browser
- [ ] diff check

## Definition of Done

## Caveats
```

---

## 15. قالب مراجعة الكود

```markdown
### Architecture
- [ ] الطبقة صحيحة
- [ ] مفيش dependency عكسية
- [ ] public API محدود

### Code quality
- [ ] types واضحة
- [ ] مفيش any/eval
- [ ] naming مطابق للمشروع
- [ ] التعليقات للسبب فقط

### UI
- [ ] tokens مستخدمة
- [ ] RTL/LTR
- [ ] light/dark
- [ ] responsive
- [ ] focus/ARIA
- [ ] reduced motion

### Lifecycle
- [ ] listeners cleanup
- [ ] frames cleanup
- [ ] لا duplicate loops
- [ ] unmount آمن

### Verification
- [ ] typecheck
- [ ] lint
- [ ] test
- [ ] build
- [ ] browser console
- [ ] screenshot عند الحاجة

### Documentation
- [ ] PRD لو العقد تغير
- [ ] SPECKIT لو الإجراء تغير
- [ ] session/changelog حسب المشروع
```

---

## 16. بروتوكول الفشل

- typecheck فشل: أصلح النوع أو العقد؛ ما تستخدمش cast لإخفاء المشكلة.
- lint فشل: أصلح القاعدة أو وثّق exception مبرر؛ ما تعطلش lint عشوائياً.
- test فشل: حدد هل المشكلة في الكود أو test قديم.
- build فشل: افحص dependency والـ config مرة واحدة قبل أي إعادة تثبيت.
- browser فشل: snapshot ثم console ثم logs؛ ما تعيدش نفس interaction عميان.
- sandbox unavailable: محاولة recovery واحدة، وبعدها أبلغ إن التحقق غير مكتمل.
- timed-out mutation: افحص الحالة قبل تكرار التعديل.

---

## 17. Git والتسليم

- اشتغل على branch المخصص، مش base branch.
- commit واحد لغرض منطقي واحد.
- رسالة commit حسب قواعد المشروع.
- راجع status وdiff قبل sync.
- نفذ `SyncGit` مرة واحدة بعد آخر تعديل.
- لا تعمل force push أو reset/rebase خطير بدون موافقة.
- لا تقول إن التغيير اتدفع لو sync فشل.

---

## 18. قواعد التوثيق المستمر

بعد milestone فعلي، حدّث ملفات الاستمرارية التي يطلبها المشروع:

- session: إيه اللي اتعمل ونتيجة الفحوص.
- changelog: التغيير المنطقي للمستخدم أو المطور.
- developments: رقم/مرحلة التنفيذ حسب convention.
- context: فقط عند قرار معماري ثابت.
- TODO: الأولويات المتبقية.

ما تحدثش ملفات لمجرد ملء شكل؛ التوثيق لازم يعكس الواقع.

---

## 19. Adaptation Checklist لأي مشروع

قبل التطبيق، املأ:

```markdown
- [ ] قرأت قواعد المشروع المضيف
- [ ] عرفت source of truth للتصميم
- [ ] عرفت import strategy
- [ ] عرفت state وpersistence policy
- [ ] عرفت test commands
- [ ] عرفت browser/preview strategy
- [ ] عرفت naming convention
- [ ] عرفت ملفات الاستمرارية المطلوبة
- [ ] حددت هل Canvas مناسب
- [ ] حددت motion وaccessibility policy
- [ ] سجلت أي تعارض أو assumption
```

---

## 20. إجابة الـ AI النهائية

أي تسليم لازم يجاوب باختصار:

1. إيه اللي اتغير؟
2. إيه الملفات اللي اتعدلت؟
3. إيه الفحوص اللي عدت؟
4. إيه اللي ما اتشغلش وليه؟
5. إيه المخاطر أو الخطوة التالية؟

ممنوع استخدام جملة عامة زي «تم» من غير دليل.

> القاعدة الأخيرة: افهم المشروع الأول، نفذ أقل تغيير كامل، اختبر السلوك الحقيقي، ووثّق اللي حصل فعلاً.
