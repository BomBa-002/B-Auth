# خطة أدوات BomBa Smart

> **توضيح أساسي:** `BombaSmart` هو اسم منظومة المكونات الذكية بالكامل، وليس مكوّناً منفرداً. `SmartInput` و`SmartButton` هما المكونات الحالية داخل المنظومة، وأي `SmartForm` أو `SmartField` مستقبلي يلتزم بنفس العقد والقواعد.

## الحالة الحالية — 02/09/2026
- `SmartInput`: منفذ ومراجع في حالات الإدخال، validation، suggestions، keyboard، ARIA، وanti-autofill.
- `SmartButton`: منفذ ومراجع في loading، disabled، lifecycle callbacks، و`ActionLockManager`.
- `ActionLockManager`: منفذ بسياسة `drop` وملكية آمنة للأقفال.
- Auth flow: تم تطبيق الأفعال الذكية على login وregister وretry.
- الاختبارات: typecheck وlint وtest وbuild ناجحة حسب آخر جلسة موثقة.
- المتبقي: إعادة فحص Preview بجلسة متصفح جديدة، وخط عربي bundled اختياري لو ظل glyph fallback مؤثراً.

## طريقة الاستكمال
1. أي مكون جديد يبدأ بعقد Props واختبارات قبل التجميل.
2. يمر عبر طبقات التصميم والـ alias المعتمدة، مع دعم RTL/LTR وLight/Dark.
3. يضيف سلوكاً ذكياً قابلاً لإعادة الاستخدام بدون ربط مخفي بـ API أو Router أو Toast.
4. بعد كل مرحلة: تحقق، ثم حدّث `AI_SESSION.md` و`CHANGELOG.md` و`DEVELOPMENTS.md`، وحدّث `TODO.md` عند تغيير الحالة.


## الهدف
بناء طبقة أدوات واجهة قابلة لإعادة الاستخدام مثل `SmartInput` و`SmartButton`، مع سلوك موحّد للـ validation، الاقتراحات، مكافحة autofill، وإمكانية الوصول، بدون كسر دعم RTL/LTR أو Light/Dark.

## القواعد المشتركة
- كل القياسات التصميمية تستخدم `em` أو `rem` أو `%`؛ ممنوع `px`.
- كل الألوان تمر عبر CSS Variables بصيغة HSL/HSLA، بدون ألوان ثابتة داخل المكونات.
- استخدام CSS Logical Properties بدلاً من `left/right` و`padding-left/right`.
- الاستيرادات داخل Frontend تمر من `@a`، وكل أيقونة من `lucide-react` تُصدّر باسم يبدأ بـ `Icon`.
- كل عنصر تفاعلي له اسم وصول واضح وFocus بصري؛ لا يعتمد عرض الحالة على اللون وحده.
- الحركة وظيفية وقصيرة وتحترم `prefers-reduced-motion`.

## SmartInput
### السلوك
- يدعم controlled وuncontrolled state و`forwardRef`.
- Label عائم يعتمد على `:focus` و`:not(:placeholder-shown)` مع `placeholder=" "`.
- زر التفريغ يظهر عند وجود قيمة ومع التركيز أو التفاعل، ويعمل بـ `onClear` و`onChange`.
- زر إظهار/إخفاء كلمة المرور يظهر فقط لنوع password مع وجود قيمة.
- زر البحث يظهر فقط عند `searchable` ووجود قيمة، ويستدعي `onSearch`.
- كل أزرار التحكم الداخلية `tabIndex={-1}` مع `aria-label` و`title`.
- الاختصارات: `Ctrl+Backspace` للتفريغ، `Ctrl+Enter` للبحث، الأسهم للتنقل، `Enter` للاختيار، `Escape` و`Tab` لإغلاق الاقتراحات.

### Validation
- الحالات: `default` و`success` و`error`.
- حالة التحقق تُعرض بأيقونة Lucide في نهاية الحقل مع Tooltip CSS فقط.
- `validationMessage` و`error` يظهران كنص مساعد مرتبط عبر `aria-describedby`.
- `aria-invalid` و`aria-errormessage` يتفعّلان عند الخطأ، و`aria-live` يعلن التغيير.
- حالة التحقق تتغلب بصرياً على focus في لون الإطار والأيقونة والـ label.

### Custom Autocomplete
- القائمة المخصصة هي البديل الوحيد لقائمة المتصفح عند وجود `suggestions`.
- تستخدم `role="combobox"` و`role="listbox"` و`role="option"` و`aria-activedescendant`.
- تدعم filtering، grouping، initials/avatar، وصفاً ثانوياً، تمييز المطابقة، active arrow، وempty state.
- تختفي عند النقر خارج المكوّن أو `Escape` أو `Tab` أو اختيار عنصر.
- لا تستخدم `index` كمفتاح React؛ تستخدم `suggestion.id`.

### Autofill
- احترام `autoComplete` الذي يمرره المستهلك؛ القيمة الافتراضية `off` للنص و`new-password` لكلمة المرور.
- تطبيق readonly guard عند البداية للحقول الفارغة، وإزالته عند التركيز.
- إضافة `autoCorrect` و`autoCapitalize` و`spellCheck` مع احترام القيم الممررة.
- إضافة `data-1p-ignore` و`data-lpignore` و`data-bwignore` و`data-form-type`.
- دعم Chrome عبر `:-webkit-autofill` وFirefox عبر `:-moz-autofill` بدون ألوان أو قياسات ثابتة.

## SmartButton
- مكوّن موحّد للأنماط `primary` و`secondary` و`danger` و`ghost`.
- يدعم `loading` و`disabled`، ويمنع التفاعل أثناء التحميل.
- يستخدم أيقونات `Icon*` مع `aria-label` عند غياب النص.
- يحافظ على Touch Target مناسب وFocus واضح وحالات hover/active عبر Tokens.

## SmartForm وSmartField
- تجميع الحقول مع label وdescription وerror في API واحد.
- تمرير `id` و`name` و`aria-describedby` بشكل ثابت.
- فصل validation logic عن العرض، مع أنواع TypeScript واضحة وبدون `any`.

## خطة التنفيذ والاختبار
1. مراجعة العقد والأنواع والتصديرات المركزية.
2. تنفيذ السلوك والتفاعل قبل التجميل البصري.
3. تطبيق CSS tokens وRTL/LTR وLight/Dark وanti-autofill.
4. اختبار الفارغ، الممتلئ، disabled، password، search، validation، suggestions، no results، keyboard، وoutside click.
5. تشغيل typecheck وlint وtest وbuild.
6. اختبار Preview بصرياً على viewport موبايل وdesktop، ومراجعة Console وARIA والـ overflow.

## Definition of Done
- كل زر تفريغ/رؤية/بحث ظاهر في شروطه ويعمل فعلياً.
- رسائل وأيقونات validation مطابقة للخطة وقابلة للوصول.
- قائمة الاقتراحات مخصصة بالكامل ولا تظهر قائمة autofill الأصلية.
- `.smart-input-action` تحتوي على:

```css
min-inline-size: 1.25em;
min-block-size: 1.25em;
```

- لا توجد أخطاء TypeScript أو lint أو build أو اختبارات فاشلة.
- التوثيق يعكس الواقع ولا يعلن إتمام بند غير مختبر.
