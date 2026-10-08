# PRD — BombaSmart و AppBackground

## 1. غرض الوثيقة

الوثيقة دي Product Requirements Document مرنة، قابلة لإعادة الاستخدام في أي مشروع Frontend أو Desktop أو Monorepo، وبتعرّف المطلوب من منظومة **BombaSmart** ومكوّن **AppBackground** من غير ما تربطهم بمنتج بعينه أو Framework بعينه.

الوثيقة بتحدد **ليه** النظام موجود، **إيه** السلوك المطلوب، **إيه** اللي خارج النطاق، وإزاي نقيس نجاح التنفيذ. طريقة التنفيذ التفصيلية، وبوابات الـ AI، وقواعد المراجعة موجودة في `SPECKIT.md`.

> القاعدة: الـ PRD يصف المنتج والعقد؛ لا يفرض أسماء مجلدات أو مكتبات إلا لما يحددها المشروع المضيف في وثائقه الرسمية.

---

## 2. طريقة استخدام الوثيقة في مشروع جديد

قبل استخدام الخطة:

1. اقرأ ملفات المشروع المرفقة: قواعد العمل، المعمارية، التصميم، الاستمرارية، والمهارات.
2. اعتبر قواعد المشروع المضيف أعلى من أي default هنا.
3. املأ قسم **Project Adaptation Record** في آخر الملف.
4. اربط كل requirement بملف أو مكوّن أو اختبار فعلي.
5. لو في تعارض بين الوثيقة والمشروع، لا تخمّن؛ سجّل التعارض وطبّق مصدر الحقيقة الخاص بالمشروع.
6. لا تنشئ BombaSmart بالكامل لمجرد أن الخطة موجودة؛ نفّذ الجزء المطلوب فقط.

---

## 3. تعريفات أساسية

### 3.1 BombaSmart
اسم لمنظومة مكونات UI ذكية. المكوّن الذكي هو مكوّن بيضيف سلوكاً قابلاً لإعادة الاستخدام فوق primitive موجود، من غير ما يخلط business logic أو API integration أو routing داخله.

### 3.2 AppBackground
طبقة بصرية decorative بتظهر خلف محتوى التطبيق. هي غير ضرورية لفهم الوظائف، لا تحتوي على business data، ولا يجب أن تمنع التفاعل أو تزيد الحمل بلا داعٍ.

### 3.3 Primitive
مكوّن أساسي مسؤول عن markup وstyling وsemantics البسيطة.

### 3.4 Feature Adapter
طبقة خاصة بميزة أو شاشة معينة، بتربط primitive بحالة feature أو API أو store. الـ adapter هو المكان الصحيح لمنطق login أو checkout أو workflow.

### 3.5 Motion Policy
سياسة تشغيل الحركة، وتحدد هل الحركة `off` أو `calm` أو `full` أو قيمة مكافئة يحددها المشروع.

---

## 4. الرؤية

نبني منظومة UI قابلة للصيانة والتوسع، بحيث:

- السلوك العام يتكتب مرة واحدة.
- المكونات تفضل صغيرة وواضحة.
- التغيير في مشروع لا يكسر مشاريع أو شاشات تانية.
- الإتاحة والأداء جزء من العقد، مش تحسين لاحق.
- الـ AI يقدر يكمل الشغل من غير ما يعيد فهم المشروع كل مرة.

---

## 5. المشكلة

من غير عقد واضح، غالباً بيحصل الآتي:

- مكونات ذكية ضخمة تجمع العرض، الـ state، الـ API، والـ navigation.
- تكرار منطق loading وvalidation وkeyboard في كل شاشة.
- Animation شغالة طول الوقت حتى لو التبويب مخفي أو المستخدم رافض الحركة.
- imports أو tokens مخالفة لنظام المشروع.
- تغييرات AI واسعة بتلمس ملفات مش مرتبطة بالطلب.
- نجاح build بيتاخد كدليل وحيد رغم وجود أخطاء سلوكية أو accessibility.

---

## 6. الأهداف

### 6.1 أهداف BombaSmart

1. توفير مكونات behavior قابلة لإعادة الاستخدام.
2. توحيد حالات `loading`, `disabled`, `error`, `success`, و`locked`.
3. دعم controlled وuncontrolled APIs بعقد واضح.
4. دعم keyboard وARIA وfocus management.
5. فصل الـ presentation عن feature integrations.
6. الالتزام بنظام import والـ design tokens الخاص بالمشروع المضيف.
7. جعل السلوك قابل للاختبار بدون API حقيقي أو browser كامل كل مرة.

### 6.2 أهداف AppBackground

1. تقديم خلفية هادئة لا تنافس المحتوى.
2. تشغيل الحركة فقط لما تكون مسموحة ومفيدة.
3. احترام `prefers-reduced-motion` وإعداد المستخدم.
4. إيقاف الموارد عند إخفاء الصفحة أو unmount.
5. الاستجابة لتغيير viewport وDPR وtheme بدون leaks.
6. عدم التأثير على layout أو pointer events أو قابلية قراءة المحتوى.

---

## 7. خارج النطاق

العناصر دي ممنوعة ضمن التنفيذ الافتراضي إلا بقرار منفصل:

- تغيير الـ framework أو state manager.
- إنشاء Design System جديد بديل عن الموجود.
- إضافة database أو API للخلفية البصرية.
- حفظ بيانات باستخدام localStorage أو أي persistence غير معتمد.
- إضافة WebGL أو مكتبة ثقيلة من غير profiling وسبب واضح.
- إضافة Toast أو Router أو Query client داخل primitive.
- إعادة كتابة كل UI دفعة واحدة.
- تغيير public API من غير تحديث callers والاختبارات والوثائق.
- استخدام `eval` أو تنفيذ نصوص ككود.

---

## 8. المستخدمون

### المستخدم النهائي
عايز واجهة واضحة، سريعة، شغالة بالكيبورد، ومش بتزعجه بالحركة.

### المطور
عايز يضيف behavior جديد من غير copy/paste أو معرفة تفاصيل داخلية غير لازمة.

### الـ AI agent
عايز contract صريح، scope محدود، مصادر حقيقة واضحة، وخطوات تحقق قابلة للإثبات.

### المراجع
عايز يقدر يراجع التغيير من diff صغير، acceptance criteria، ونتائج فحوص واضحة.

---

## 9. المعمارية الوظيفية

```text
Design Tokens / Base UI
        ↓
Smart Primitives
        ↓
Feature Adapters / Hooks
        ↓
Pages, Screens, Workflows
```

### قاعدة الاعتماد

- الـ primitive لا يعرف feature محددة.
- الـ feature adapter لا يعيد بناء primitive.
- البيانات الخارجية تدخل من hook أو service معتمد.
- الـ public exports تمر من النظام المركزي في المشروع لو كان موجوداً.
- كل طبقة تعتمد على اللي تحتها فقط.

---

## 10. BombaSmart — المتطلبات العامة

كل Smart Component لازم يوثق:

- المسؤولية الأساسية.
- props العامة والاختيارية.
- controlled/uncontrolled contract.
- الحالات الداخلية والخارجية.
- الأحداث والـ callbacks.
- keyboard model.
- ARIA model.
- loading وdisabled semantics.
- RTL/LTR والثيم.
- cleanup والموارد.
- الاختبارات المطلوبة.

### 10.1 قواعد props

كل prop لازم يكون واضح النوع:

- data input
- visual variant
- controlled state
- event callback
- accessibility override
- integration injection

ممنوع props غامضة زي `magic` أو `advanced` أو `doEverything`.

### 10.2 controlled/uncontrolled

- وجود `value` يعني إن القيمة controlled.
- `defaultValue` يستخدم للتهيئة فقط.
- ماينفعش internal state تنافس controlled prop.
- callbacks ترجع القيمة الفعلية.
- derived state يتحسب مباشرة قدر الإمكان.
- أي synchronization ضروري يتوثق ويتختبر.

### 10.3 الإتاحة

- كل interactive element له accessible name.
- رسائل الخطأ ترتبط بالعنصر بـ ids ثابتة.
- اللون مش الوسيلة الوحيدة للحالة.
- focus ring واضح.
- keyboard flow موثق.
- لو في combobox أو listbox، استخدم roles وrelationships صحيحة.
- عند Enter handlers، راعي IME composition: لا submit أثناء composition أو عند `keyCode === 229`.

### 10.4 الأداء

- لا تستخدم effects لجلب بيانات؛ استخدم pattern المشروع المعتمد.
- لا تنشئ objects أو callbacks بلا سبب في hot paths.
- لا تعمل global listeners بدون cleanup.
- لا تستخدم memoization قبل وجود سبب قابل للقياس.

---

## 11. SmartInput — عقد مرجعي اختياري

لو المشروع محتاج input ذكي، يدعم حسب الحاجة:

- text, password, search، أو النوع الذي يحدده المشروع.
- controlled/uncontrolled value.
- label وdescription وerror.
- clear action.
- password visibility.
- suggestions/combobox.
- validation states.
- forwarded ref.
- keyboard navigation.
- autofill محترم، بدون التحايل على password managers.

### معايير القبول

- القيمة لا تضيع عند rerender.
- error مرتبط بالـ input.
- disabled يمنع التغيير فعلاً.
- suggestion ids ثابتة، بدون array index keys.
- Escape وEnter وArrow keys موثقة ومختبرة.
- RTL لا يكسر ترتيب icons أو النص.

---

## 12. SmartButton — عقد مرجعي اختياري

يدعم حسب حاجة المشروع:

- variants وsizes من النظام الحالي.
- start/end icons من نظام الأيقونات المعتمد.
- loading controlled أو automatic.
- disabled semantics.
- `aria-busy` عند الحاجة.
- منع double-submit.
- action lock اختياري عبر service مستقلة.
- callbacks success/error/settled بدون ربط تلقائي بـ integration.

### معايير القبول

- handler لا يتكرر أثناء نفس التنفيذ.
- exception وfailure يحرروا الموارد.
- زر icon-only له accessible name.
- navigation أو API مش جوه primitive.
- تغيير loading لا يسبب layout shift كبير قدر الإمكان.

---

## 13. AppBackground — العقد الوظيفي

### 13.1 السلوك

| الحالة | السلوك المطلوب |
|---|---|
| disabled | لا مشهد مرئي ولا loop فعال |
| reduced motion | static أو إيقاف آمن، بدون parallax |
| off | بدون حركة |
| calm | حركة بسيطة، بدون مؤثرات غير ضرورية |
| full | كل المؤثرات المسموحة ضمن حدود الأداء |
| hidden tab | إيقاف الرسم |
| visible tab | استئناف loop واحد |
| unmount | إلغاء كل الموارد |

### 13.2 Canvas

لو استخدم المشروع Canvas:

- حد DPR إلى قيمة مناسبة.
- اضبط backing store مع viewport الحقيقي.
- استخدم `setTransform` بعد resize.
- امسح الرسم قبل frame جديد.
- رجّع context state بعد كل مرحلة.
- اقرأ الألوان من tokens، مش من قيم hardcoded.
- لا تنشئ gradients أو arrays داخل loop إلا لو ضروري.
- لا تسمح بأكثر من animation loop.

### 13.3 DOM/CSS

- decorative root يحمل `aria-hidden="true"`.
- `pointer-events: none` لو الخلفية مش تفاعلية.
- لا تسبب scrollbars.
- لا تغير أبعاد layout.
- z-index من tokens المشروع.
- القياسات والألوان من نظام المشروع.

---

## 14. المتطلبات غير الوظيفية

### الأمان

- ممنوع secrets داخل component.
- ممنوع تنفيذ strings ككود.
- ممنوع HTML غير آمن من input المستخدم.
- أي external asset أو dependency يحتاج مبرر ومراجعة.

### المرونة

- أسماء الملفات والمسارات تتكيف مع المشروع المضيف.
- لو المشروع لا يستخدم Canvas، استخدم renderer مناسب بعد توثيق القرار.
- لو المشروع لا يستخدم alias، اتبع import convention الخاص به.
- لو المشروع يستخدم Vue أو Svelte، حوّل العقود للسياق المقابل بدون نسخ React APIs.

### قابلية النقل

أي مشروع يعيد استخدام الوثيقة لازم يعمل adaptation record يحدد:

- نوع التطبيق.
- framework.
- design system.
- state strategy.
- import strategy.
- test commands.
- browser strategy.
- persistence policy.

---

## 15. مصفوفة المتطلبات

| ID | المتطلب | الأولوية | دليل النجاح |
|---|---|---:|---|
| CORE-001 | عقد component واضح | عالية | types + tests + docs |
| CORE-002 | فصل primitive عن feature | عالية | dependency review |
| CORE-003 | keyboard وARIA | عالية | component/browser tests |
| CORE-004 | احترام design system | عالية | token/diff review |
| BG-001 | تشغيل/إخفاء الخلفية | عالية | behavior test |
| BG-002 | reduced motion | عالية | browser + unit |
| BG-003 | visibility pause | عالية | lifecycle test |
| BG-004 | resize وDPR | عالية | canvas test |
| BG-005 | cleanup كامل | عالية | unmount test |
| BG-006 | no overflow | متوسطة | responsive screenshot |
| SMART-001 | loading واضح | عالية | interaction test |
| SMART-002 | no double-submit | عالية | lock test |
| SMART-003 | alias/import compliance | عالية | lint/static review |

---

## 16. الاختبارات وDefinition of Done

### الاختبارات

- unit للـ pure logic.
- component للحالات والـ callbacks.
- browser للسلوك المرئي والتفاعلي.
- accessibility للـ roles وlabels وkeyboard.
- performance عند وجود animation أو hot path.

### Definition of Done

- العقد محدث ومفهوم.
- التغيير أقل scope كامل.
- لا توجد imports أو tokens مخالفة.
- cleanup كامل.
- reduced motion وvisibility وresize مختبرة عند ارتباطها.
- Light/Dark وRTL/LTR مختبرة عند وجودها.
- typecheck/lint/test/build شغالة حسب المشروع.
- التوثيق والاستمرارية محدثة عند وجود تغيير فعلي.
- كل caveat مكتوب، ولا يتم إعلان نجاح غير مثبت.

---

## 17. المخاطر

- Canvas أو الحركة قد تستهلك موارد الأجهزة الضعيفة.
- computed styles قد تكون مكلفة داخل frame.
- تغييرات autofill قد تؤثر على password managers.
- public API الواسع يصعّب التطوير؛ ابدأ بأقل props.
- نقل الوثيقة لمشروع مختلف بدون adaptation يؤدي لتعارضات.

---

## 18. Project Adaptation Record

يتم ملء القسم ده قبل أول تنفيذ في أي مشروع:

```yaml
project_name: ""
project_type: "web | desktop | mobile | library"
framework: ""
frontend_root: ""
source_of_truth_docs:
  - ""
import_strategy: ""
ui_system: ""
state_strategy: ""
persistence_policy: ""
css_units: ""
color_strategy: ""
rtl_support: "required | optional | none"
theme_support: "light | dark | both | none"
test_commands:
  typecheck: ""
  lint: ""
  unit: ""
  build: ""
browser_verification: "required | optional"
allowed_paths:
  - ""
forbidden_paths:
  - ""
open_decisions:
  - ""
```

---

## 19. قرار تغيير العقد

أي تغيير في public props، state persistence، dependency، renderer، أو architecture يحتاج:

1. وصف المشكلة.
2. البدائل المرفوضة وسبب الرفض.
3. أثر التغيير على callers.
4. خطة migration.
5. تحديث SPECKIT والاختبارات.
6. قرار موثق في سجل المشروع.

> النتيجة المطلوبة: BombaSmart وAppBackground يبقوا قابلين للنقل، لكن مش منفصلين عن قواعد المشروع اللي بيتنفذوا جواه.
