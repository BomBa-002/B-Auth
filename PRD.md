# PRD — منظومة BombaSmart و App Background

## 1. الغرض من الوثيقة

الوثيقة دي هي Product Requirements Document (PRD) مفصلة لمنظومة `BombaSmart` ومكون `app-background.tsx` داخل مشروع B-Auth. الهدف إنها تكون مرجع ثابت للـ AI وأي مطور بيشتغل على المشروع، بحيث أي تطوير أو تحديث يحصل بنفس المعمارية، نفس أسلوب كتابة الكود، نفس تنظيم الملفات، ونفس قواعد الجودة والأمان.

## 2. تعريف المنتج

### 2.1 BombaSmart

`BombaSmart` هو اسم منظومة المكونات الذكية في المشروع. المكونات الحالية:

- `SmartInput`: إدخال ذكي مع validation وsuggestions
- `SmartButton`: تنفيذ أفعال مع loading وdisabled
- `ActionLockManager`: إدارة أقفال الأفعال المتعارضة
- `AppBackground`: طبقة خلفية تفاعلية

### 2.2 App Background

`Frontend/src/components/app-background.tsx` هو مكون خلفية بصري عام يوفر:

- Canvas للرسم الديناميكي
- Orbs بألوان مستخرجة من CSS variables
- حركة calm/full/off
- إيقاف الحركة عند `prefers-reduced-motion`
- إيقاف الرسم عند عدم رؤية الصفحة

## 3. المشكلة التي بنحلها

المشروع محتاج طبقة UI ذكية ومتسقة تضمن:

1. السلوك التفاعلي لا يتكرر بين الشاشات
2. حالات loading وdisabled واضحة وقابلة للوصول
3. المؤثرات البصرية لا تستهلك موارد
4. أي AI يقدر يكمل الشغل من غير architecture جديدة
5. التوافق مع كل tools المشروع

## 4. أهداف المنتج

### أهداف أساسية

- توحيد عقد المكونات الذكية
- فصل presentation عن business logic
- ضمان Accessibility وkeyboard support
- احترام `prefers-reduced-motion`
- منع side effects مخفية
- الحفاظ على الأداء

## 5. المتطلبات الوظيفية

### SmartButton

لازم يدعم:

- `action` sync أو async
- `loading` controlled
- `disabled` حقيقي
- `lockKey` و`lockGroup`
- سياسة `drop` للمحاولات المتعارضة
- `onSuccess`, `onError`, `onSettled`

### SmartInput

لازم يحافظ على:

- controlled وuncontrolled usage
- forwardRef
- labels وdescriptions وerrors مرتبطة بـ ARIA
- validation states
- keyboard navigation

### App Background

الحالات:

- `showBackground = false`: الخلفية مخفية
- `backgroundMotion = 'off'`: رسم ثابت
- `backgroundMotion = 'calm'`: حركة هادئة
- `backgroundMotion = 'full'`: حركة كاملة
- `prefers-reduced-motion: reduce`: تعطيل الحركة
- `document.visibilityState !== 'visible'`: عدم جدولة frames

## 6. معايير القبول

- [ ] كل Component له contract مكتوب
- [ ] كل Component له unit tests
- [ ] لا يوجد business side effect مخفي
- [ ] keyboard وARIA تم اختبارهم
- [ ] RTL/LTR وLight/Dark تم مراجعتهما
- [ ] typecheck وlint وtest وbuild ناجحة
- [ ] يظهر ويختفي حسب `showBackground`
- [ ] لا توجد أخطاء Console
- [ ] animation تتوقف مع reduced motion
- [ ] animation لا تستمر في tab غير مرئي
- [ ] resize لا يسبب مشاكل
- [ ] cleanup تم اختباره

## 7. Definition of Done

التطوير يعتبر مكتمل فقط لما الكود والاختبارات والتوثيق يعكسوا نفس الحالة الفعلية.
