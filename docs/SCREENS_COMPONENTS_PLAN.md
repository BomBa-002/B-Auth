# خطة إعادة إنشاء نظام الافتتاحي والأخطاء

> **الغرض:** مرجع تنفيذي مستقل لإعادة إنشاء شاشات ومكونات نظام الافتتاحي (Splash/Bootstrap) ونظام الأخطاء (Bootstrap Error/Runtime Health/Recovery) في مشروع آخر، مع الحفاظ على السلوك، التسلسل البصري، قابلية الوصول، RTL/LTR، والثيمات.
>
> **نطاق الخطة:** الشاشة الافتتاحية، شاشة فشل الإقلاع، حاجب انقطاع الخدمة، التخطيط العام للشاشات، شريط حالة النظام، الخلفية البصرية، الشعار، الزر الذكي، ومصادر الحالة والمنطق المرتبط بهذه الأنظمة.
>
> **ملاحظة مهمة:** الخطة دي بتوصف عقد وسلوك النظام، مش نسخاً حرفياً لأسماء الملفات. في المشروع الجديد ممكن تتغير أسماء الملفات، لكن لازم يفضل نفس الفصل بين الحالة والمنطق والعرض.

---

## 1. الهدف النهائي

إنشاء بوابة تشغيل موثوقة واحترافية للتطبيق تعمل كالتالي:

1. المستخدم يفتح التطبيق أو يعمل Refresh.
2. تظهر شاشة افتتاحية ثابتة بصرياً ومرتبطة فعلياً بحالة الإقلاع.
3. النظام يفحص صحة الـ Backend ويحاول استعادة الجلسة.
4. تظهر مراحل الإقلاع والتقدم بشكل مفهوم، من غير ادعاء اكتمال قبل اكتمال العملية فعلياً.
5. عند النجاح يتم التوجيه للشاشة المناسبة.
6. عند فشل الإقلاع تظهر شاشة خطأ قابلة للاستعادة بزر إعادة المحاولة.
7. بعد بدء التطبيق تستمر مراقبة صحة النظام فوق كل الشاشات.
8. عند انقطاع الخدمة يظهر حاجب واضح، وعند عودتها يتم رفع الحجب تلقائياً وإرجاع المستخدم لنفس الشاشة.

النتيجة المطلوبة هي نظام يشرح للمستخدم **إيه اللي بيحصل، وإيه اللي فشل، وإيه الإجراء المتاح دلوقتي** بدون رسائل تقنية مربكة أو انتقالات مفاجئة.

---

## 2. المبادئ الحاكمة

### 2.1 فصل المسؤوليات

- **الحالة:** تحدد المرحلة الحالية فقط، مثل `idle`, `running`, `retrying`, `ready`, `degraded`, `error`.
- **المنطق:** يدير الإقلاع، إعادة المحاولة، المهلات، واستعادة الجلسة.
- **العرض:** يحول الحالة إلى شاشة ومكونات مرئية.
- **التصميم:** يحدد الـ tokens، المسافات، الألوان، الحركة، وRTL/LTR.
- **الخدمات:** مسؤولة عن استدعاء Health/Auth APIs فقط، بدون JSX أو قرارات واجهة.

ممنوع وضع طلبات API أو منطق retry داخل مكون React الخاص بالشاشة.

### 2.2 الحالة هي مصدر الحقيقة

لا يتم تشغيل الانتقال من Splash إلى الشاشة التالية باستخدام `setTimeout` مستقل. الانتقال يعتمد على نتيجة الـ bootstrap، مع إمكانية فرض مدة عرض دنيا فقط لو المنتج محتاج يمنع الوميض البصري.

### 2.3 الفشل قابل للاستعادة

كل فشل متوقع لازم يحدد:

- عنوان مفهوم.
- وصف مختصر.
- تفاصيل اختيارية للمطور أو المستخدم المتقدم.
- إجراء واضح: Retry أو فحص فوري.
- سلوك بعد عودة الخدمة.

### 2.4 النظام يراقب نفسه

فحص الصحة مش خاص بشاشة الافتتاحي. لازم يكون Provider أو Middleware مركب عند جذر التطبيق، عشان يغطي Splash وAuth وHome وError بنفس السياسة.

---

## 3. خريطة النظام المقترحة

```text
AppRoot
├── RuntimeHealthProvider
│   ├── AppBackground
│   ├── ScreenRouter / AppShell
│   │   ├── SplashScreen
│   │   │   ├── ScreenLayout
│   │   │   ├── Logo
│   │   │   ├── BootProgressRing
│   │   │   └── BootStepList
│   │   ├── BootstrapErrorScreen
│   │   │   ├── ScreenLayout
│   │   │   ├── ErrorIconBadge
│   │   │   ├── AlertItem
│   │   │   └── RetryButton
│   │   └── باقي الشاشات
│   └── HealthBlocker عند الانقطاع
└── SystemStatusBar داخل ScreenLayout
```

### 3.1 الطبقات

- **Application layer:** `AppRoot`, `RuntimeHealthProvider`.
- **Feature layer:** `bootstrap`, `health`, `auth`.
- **Screen layer:** Splash وError screens.
- **Component layer:** Layout، StatusBar، Progress، Alert، Button، Logo.
- **Style layer:** Design tokens وCSS الخاص بالشاشات.

---

## 4. نموذج الحالة والبيانات

### 4.1 Bootstrap status

```ts
export type BootstrapStatus =
  | 'idle'
  | 'running'
  | 'retrying'
  | 'ready'
  | 'degraded'
  | 'error'
```

المعنى:

| الحالة | المعنى | سلوك الواجهة |
|---|---|---|
| `idle` | لم يبدأ الإقلاع بعد | Splash في وضع الاستعداد/البدء |
| `running` | فحص الصحة واستعادة الجلسة شغالين | Progress نشط ومرحلة حالية متحركة |
| `retrying` | محاولة فاشلة ويعاد الفحص | نفس Splash مع دلالة إعادة المحاولة |
| `ready` | كل المتطلبات الأساسية نجحت | اكتمال 100% ثم التوجيه |
| `degraded` | التطبيق يقدر يكمل لكن خدمة ثانوية غير متاحة | اكتمال الإقلاع مع Status warning |
| `error` | فشل يمنع التشغيل الطبيعي | شاشة خطأ مع Retry |

### 4.2 Runtime health state

```ts
export type HealthLevel = 'healthy' | 'degraded' | 'critical'

export interface RuntimeHealthState {
  level: HealthLevel
  detail?: string
  lastCheckedAt?: string
  isChecking: boolean
}
```

- `healthy`: لا يوجد حاجب، وشريط الحالة يعرض حالة الشاشة.
- `degraded`: لا يوجد حاجب غالباً، لكن شريط الحالة يعرض تحذيراً.
- `critical`: يظهر `HealthBlocker` فوق الشاشة الحالية.

### 4.3 نتيجة الإقلاع

```ts
export interface BootstrapResult {
  user: AuthUser | null
  accessToken: string | null
  persistent: boolean
  health: HealthReport
  metadata: RetryMetadata
}
```

الـ UI لا يعرف تفاصيل التوكن أو طريقة التخزين؛ يستقبل فقط نتيجة typed من orchestrator.

---

## 5. شاشة الافتتاحي SplashScreen

### 5.1 الهدف الوظيفي

- طمأنة المستخدم إن التطبيق بيبدأ بشكل صحيح.
- عرض هوية المنتج بسرعة.
- توضيح مراحل الإقلاع الفعلية.
- منع عرض شاشة ناقصة أو غير جاهزة.
- إعطاء معنى بصري للتقدم بدون مبالغة أو حركة مشتتة.

### 5.2 التركيب البصري

الترتيب من أعلى لأسفل:

1. هوية التطبيق: الشعار، اسم التطبيق، والـ tagline.
2. حلقة تقدم دائرية في المنتصف.
3. نسبة التقدم الرقمية.
4. بطاقة Terminal/Logs تحتوي مراحل الإقلاع.
5. `SystemStatusBar` في أسفل `ScreenLayout`.

التخطيط يكون عمودياً، centered، بعرض مرن، ومسافات مأخوذة من Design Tokens. ممنوع وضع عناصر باستخدام إحداثيات ثابتة أو absolute positioning إلا لو العنصر زخرفي فعلاً.

### 5.3 عقد المكون

```ts
interface SplashScreenProps {
  status: BootstrapStatus
}
```

الشاشة لا تستقبل `progress` منفصل من الخارج؛ تحسبه من الحالة أو تستقبل View Model موحد. الهدف منع اختلاف العدّاد عن الحالة الحقيقية.

### 5.4 Progress mapping

يجب تعريف دالة pure قابلة للاختبار:

```ts
export function getSplashProgress(status: BootstrapStatus): number {
  switch (status) {
    case 'ready':
    case 'degraded':
      return 100
    case 'running':
    case 'retrying':
      return 68
    case 'idle':
      return 0
    case 'error':
    default:
      return 0
  }
}
```

القيم دي مثال من السلوك الحالي؛ في المشروع الجديد ممكن تتغير، لكن لازم تفضل القاعدة ثابتة: **التقدم يعبّر عن حالة state machine، وليس عن مؤقت عشوائي**.

### 5.5 حلقة التقدم

- استخدم `conic-gradient` أو مكون Progress accessible.
- اربط زاوية الحلقة بنفس قيمة النسبة:
  `progress * 3.6deg`.
- المركز يعرض النسبة كنص واضح.
- أضف:
  - `role="progressbar"`
  - `aria-valuemin="0"`
  - `aria-valuemax="100"`
  - `aria-valuenow={progress}`
  - `aria-label` مترجم.
- لا تعتمد على اللون وحده؛ الرقم والنص يوضحان الحالة.

### 5.6 خطوات الإقلاع

المراحل المرجعية:

1. Modules.
2. Security.
3. Health.
4. Session.
5. Configuration.

```ts
type BootStepState = 'done' | 'active' | 'pending'

interface BootStepProps {
  state: BootStepState
  label: string
}
```

السلوك:

- `done`: علامة نجاح ثابتة.
- `active`: سهم/مؤشر مع حركة بسيطة أو نقاط تحميل.
- `pending`: مؤشر محايد بدون ادعاء فشل.
- استخدم `aria-live="polite"` للحاوية، وليس لكل عنصر بشكل مزعج.
- استخدم نصوص ترجمة، ولا تكتب نصوصاً صلبة داخل JSX.

### 5.7 الحالات البصرية

- **Idle:** هوية واضحة، تقدم 0، لا يوجد Loading مبالغ فيه.
- **Running:** خطوة واحدة فقط active، والـ progress يتحرك حسب الحالة.
- **Retrying:** حافظ على نفس layout، وغيّر النص إلى معنى إعادة المحاولة.
- **Ready/Degraded:** اكتمال 100% ثم الانتقال بعد اكتمال أي minimum display duration.
- **Error:** لا تترك المستخدم على Splash بشكل دائم؛ انتقل لشاشة الخطأ.

---

## 6. شاشة فشل الإقلاع BootstrapErrorScreen

### 6.1 الهدف الوظيفي

توضح إن التطبيق لم يقدر يكتمل، لكن المشكلة قابلة لإعادة المحاولة. الشاشة لا تعرض Stack Trace للمستخدم العادي، ولا تستخدم رسالة عامة غير مفيدة.

### 6.2 التركيب

1. أيقونة خطأ داخل Badge واضح.
2. Eyebrow أو تصنيف للحالة.
3. عنوان رئيسي.
4. وصف مختصر.
5. Alert item يوضح أن الإقلاع فشل.
6. زر Retry أساسي.
7. شريط الحالة في أسفل التخطيط.

### 6.3 عقد المكون

```ts
interface BootstrapErrorScreenProps {
  message?: string
  onRetry: () => void | Promise<void>
}
```

قواعد:

- `message` اختياري؛ لو مش موجود استخدم ترجمة fallback.
- `onRetry` لا ينفذ مرتين في نفس الوقت.
- الزر يعرض Loading أثناء الإجراء.
- بعد الفشل المتكرر لا تضف أزراراً كثيرة؛ الأفضل الحفاظ على Retry وإضافة تفاصيل اختيارية فقط.

### 6.4 Accessibility

- استخدم `main` من خلال `ScreenLayout`.
- العنوان له `id` ويرتبط بـ `aria-labelledby` عند الحاجة.
- Alert الحقيقي يستخدم `role="alert"`، أما المحتوى العادي فيستخدم نصاً دلالياً بدون رفع أولوية التنبيه.
- زر Retry له Accessible Name مترجم وواضح.
- Focus يرجع للزر أو ينتقل إليه عند ظهور الشاشة.

---

## 7. HealthBlocker / Runtime Error Overlay

### 7.1 الهدف الوظيفي

حجب الواجهة عند انقطاع Backend أو فشل dependency أساسية، مع الحفاظ على الشاشة الحالية أسفل الحجب. ده أفضل من تحويل المستخدم لمسار جديد لأن الخدمة ممكن ترجع في ثواني.

### 7.2 السلوك

- يظهر فوق أي شاشة، بما فيها Splash وBootstrapError.
- يمنع التفاعل مع المحتوى الموجود أسفله.
- يشرح إن النظام متوقف مؤقتاً.
- يعرض detail اختياري من health report.
- يعرض رسالة إن النظام بيحاول الاستعادة تلقائياً.
- يوفر زر فحص فوري.
- عند رجوع الصحة إلى `healthy` يختفي تلقائياً.
- لو الإقلاع كان فاشلاً، رجوع الخدمة يعيد تشغيل bootstrap حسب سياسة المنتج.

### 7.3 عقد المكون

```ts
interface HealthBlockerProps {
  detail?: string
  onRetry: () => void | Promise<void>
}
```

### 7.4 Accessibility للـ modal blocker

- `role="alertdialog"` فقط لو الحالة تستدعي تدخل فوري.
- `aria-modal="true"`.
- `aria-labelledby` للعنوان.
- Focus ينتقل لأول عنصر تفاعلي داخل البطاقة.
- Escape لا يلغي الحجب لو الخدمة متوقفة؛ ما لم يكن عندك سلوك بديل آمن.
- لازم يكون الزر قابلاً للوصول بالكيبورد.
- لا تعرض التفاصيل التقنية وحدها؛ اعرض عنواناً ووصفاً بشرياً أولاً.

### 7.5 التصميم

- Overlay يغطي الشاشة بالكامل.
- خلفية overlay من token شفاف، مع blur محدود.
- بطاقة بعرض أقصى مناسب، Border بلون الخطأ، وShadow واضح.
- لا تستخدم لون أحمر في كل النصوص؛ خلي الأحمر للحالة والإجراء الخطر، والنص الرئيسي بلون foreground الطبيعي.

---

## 8. ScreenLayout

### 8.1 المسؤولية

مكون Shell مشترك يضمن إن كل الشاشات لها:

- نفس الخلفية.
- نفس عرض المحتوى.
- نفس السطح الرئيسي.
- نفس StatusBar.
- نفس ربط حالة الصحة الحية.

### 8.2 العقد

```ts
interface ScreenLayoutProps {
  statusLabel?: string
  statusTone?: 'ready' | 'busy' | 'error'
  version?: string
  brand?: string
  environment?: string
  children: React.ReactNode
}
```

### 8.3 قاعدة أولوية حالة الشريط

```text
health critical  → error / system down
health degraded  → busy / system degraded
health healthy   → statusTone الخاص بالشاشة
```

كده الشاشة تقدر تقول “starting”، لكن لو الـ Backend وقع، النظام كله يعرض “system down” بشكل موحد.

### 8.4 قواعد التخطيط

- `main` كجذر دلالي.
- `section` للسطح الرئيسي لو مناسب.
- `inline-size` و`block-size` والخصائص المنطقية بدل `width/height/left/right` حيث ينفع.
- `min-block-size: 100dvh` للـ viewport الحديث.
- لا Overflow أفقي.
- التخطيط يعمل على الشاشات الصغيرة من غير قص المحتوى.

---

## 9. SystemStatusBar

### 9.1 الهدف

شريط ثابت في أسفل الشاشة يعرض معلومات تشغيل مختصرة:

- حالة النظام.
- اسم البراند.
- إصدار التطبيق.
- البيئة الحالية.
- اختصارات اللغة والثيم لو موجودة.

### 9.2 حالات الألوان

- Ready: token نجاح/لون هادئ.
- Busy/Degraded: token تحذير كهرماني.
- Error/Critical: token خطأ.

لا تعتمد على اللون فقط؛ اعرض label ونص واضح، ويمكن إضافة أيقونة دلالية مع `aria-hidden` لو النص موجود.

### 9.3 قواعد التفاعل

- أزرار اللغة والثيم native buttons.
- كل زر له `aria-label` و`title` مترجم.
- Touch target لا يقل عن `2.75em`.
- focus-visible واضح.
- الأيقونات directional فقط هي التي تُعكس في RTL.

---

## 10. AppBackground

### 10.1 الهدف

إضافة عمق بصري لهوية Security Console بدون التأثير على القراءة أو الأداء.

### 10.2 التركيب

- طبقة خلفية ثابتة من Design Tokens.
- Grid خفيف باستخدام gradient.
- Canvas اختياري لدوائر/Orbs شفافة وحركة بسيطة.
- `pointer-events: none` عشان لا يعطل التفاعل.
- `aria-hidden="true"` لأنه زخرفي.

### 10.3 الأداء

- حد أقصى لـ `devicePixelRatio` لتقليل تكلفة Canvas.
- أوقف Animation عند `document.hidden`.
- أوقف الحركة عند `prefers-reduced-motion: reduce`.
- أعد الرسم الساكن فقط عند تعطيل الحركة.
- نظف `requestAnimationFrame` وكل event listeners عند unmount.
- لا تجعل الخلفية سبباً في تأخير الإقلاع أو فشل التطبيق.

### 10.4 إعدادات المستخدم

لو المشروع يدعم إعدادات الخلفية:

```ts
interface BackgroundSettings {
  showBackground: boolean
  backgroundMotion: 'off' | 'calm' | 'full'
}
```

الإعدادات تزود التحكم، لكن الـ reduced motion له أولوية على اختيار المستخدم للحركة.

---

## 11. Logo وIcon Badge وAlert Item

### Logo

- مكون عرض صامت، يقبل `aria-label` عند كونه العلامة الأساسية.
- لو زخرفي فقط يستخدم `aria-hidden="true"`.
- لا يتأثر باتجاه RTL؛ الشعار لا ينعكس.
- اللون يأتي من token، وليس من قيمة ثابتة داخل SVG/JSX لو ممكن.

### ErrorIconBadge

- يجمع الشكل والحالة الدلالية.
- لا يكتفي بالأيقونة؛ العنوان النصي لازم يظهر بجانبه.
- الأيقونة `aria-hidden` لو العنوان النصي كافي.

### AlertItem

```ts
interface AlertItemProps {
  tone: 'error' | 'warning' | 'info' | 'success'
  icon?: React.ReactNode
  children: React.ReactNode
}
```

- Border أو inline-start حسب الاتجاه.
- استخدم `border-inline-start` بدل `border-left/right`.
- النص يظل مقروءاً في Light/Dark.

---

## 12. RetryButton / SmartButton

### الهدف

منع الضغط المكرر وتوحيد lifecycle لأي إجراء قابل لإعادة المحاولة.

### العقد المقترح

```ts
interface SmartButtonProps {
  action: () => void | Promise<void>
  lockKey?: string
  lockGroup?: string
  loadingLabel?: string
  onSuccess?: () => void
  onError?: (error: unknown) => void
  children: React.ReactNode
}
```

### السلوك

1. عند الضغط يبدأ Loading.
2. يمنع التنفيذ المتزامن لنفس `lockKey`.
3. ينفذ `action` مرة واحدة.
4. عند النجاح يحرر القفل ويستعيد الحالة.
5. عند الفشل يحرر القفل ويسمح بالمحاولة التالية.
6. لا يستخدم `disabled` وحده كحل لمنع race condition؛ لازم مدير أقفال أو state موثوق.

### استخدامه في النظام

- `bootstrap:retry` لإعادة تشغيل الإقلاع.
- `runtime-health:retry` للفحص الفوري.
- لا تجعل زر Retry يطلق طلبين لو المستخدم ضغط بسرعة.

---

## 13. Bootstrap Orchestrator

### 13.1 المسؤولية

تنسيق الخطوات الخارجية بدون معرفة أي شيء عن JSX:

1. فحص Health مع retry وtimeout.
2. محاولة refresh للجلسة.
3. تجميع النتيجة.
4. إرجاع typed result.
5. ترك قرار الشاشة والـ navigation للطبقة الأعلى.

### 13.2 سياسة Retry

```ts
interface RetryPolicy {
  attempts: number
  timeoutMs: number
  backoffMs: number
  jitterMs?: number
}
```

القواعد:

- عدد محاولات محدود.
- Timeout لكل محاولة.
- Backoff بين المحاولات.
- AbortSignal لإلغاء العملية عند unmount أو تغيير المسار.
- لا تخفي كل الأخطاء خلف retry لا نهائي.

### 13.3 التعامل مع الجلسة

- فشل refresh لا يعني بالضرورة فشل التطبيق؛ ممكن المستخدم زائر.
- فشل Health الأساسي يعني فشل bootstrap لو الـ Backend مطلوب للتشغيل.
- access token يفضل في الذاكرة فقط لو نفس قرار الأمان مطلوب.
- refresh token يظل في HttpOnly cookie من Backend.

---

## 14. Runtime Health Monitor

### 14.1 السياسة

- فحص دوري كل 15 ثانية في الحالة الطبيعية.
- فحص أسرع كل 4 ثوانٍ أثناء الانقطاع.
- إيقاف polling عند `document.hidden`.
- استئناف الفحص عند عودة التاب للظهور.
- فحص فوري من زر المستخدم.
- cleanup كامل عند unmount.

### 14.2 قاعدة عدم استخدام WebSocket هنا

هدف المراقب هو اكتشاف إن الـ Backend نفسه متاح. لو الـ Backend واقع، WebSocket غالباً هيقع معه. لذلك polling مناسب للمراقبة الأساسية، بينما WebSocket/SSE يتضاف فقط لو في احتياج إشعارات لحظية منفصل.

### 14.3 انتقالات الحالة

```text
healthy → degraded → critical
critical → checking → healthy
critical → checking → degraded
```

لا تخلط بين فشل مؤقت في طلب واحد وبين critical مباشرة؛ استخدم سياسة threshold أو retry مناسبة.

---

## 15. Design Tokens والهوية البصرية

### 15.1 الاتجاه البصري

هوية B-Auth الحالية هي Security Console/Terminal:

- خلفية داكنة شبه سوداء.
- Primary كهرماني/برتقالي.
- Typography Mono للعناوين أو البيانات التقنية.
- حدود دقيقة.
- زوايا خفيفة.
- ظلال هادئة.
- تفاصيل Grid وTerminal بدون زحمة.

في المشروع الجديد، حافظ على الأدوار الدلالية حتى لو غيرت القيم.

### 15.2 Tokens المطلوبة

```css
:root {
  --color-bg: hsl(...);
  --color-bg-f: hsl(...);
  --color-py: hsl(...);
  --color-py-f: hsl(...);
  --color-md: hsl(...);
  --color-md-f: hsl(...);
  --color-ok: hsl(...);
  --color-err: hsl(...);
  --color-war: hsl(...);
  --color-inf: hsl(...);
  --color-border: hsl(...);
  --color-overlay: hsla(...);
  --shadow-md: ...;
  --shadow-lg: ...;
  --border-radius: ...;
  --spacing-sm: ...;
  --spacing-md: ...;
  --spacing-lg: ...;
  --font-family: ...;
  --font-family-mono: ...;
  --transition-fast: ...;
  --transition-normal: ...;
  --z-modal: ...;
}
```

القواعد:

- الألوان HSL/HSLA فقط.
- القياسات `em`/`rem` فقط.
- CSS Variables هي المصدر المركزي.
- لا `dark:` لو الثيم مبني على tokens.
- استخدم الخصائص المنطقية لدعم RTL.
- أي تعديل بصري يبدأ من tokens، مش من قيمة hardcoded داخل المكون.

---

## 16. RTL/LTR وi18n

### 16.1 اللغة

كل النصوص التالية لازم تكون مترجمة:

- اسم التطبيق والـ tagline.
- حالات الإقلاع.
- أسماء الخطوات.
- عنوان الخطأ ووصفه.
- Retry.
- حالة النظام.
- تفاصيل الاستعادة التلقائية.
- Labels وARIA names وtooltips.

### 16.2 الاتجاه

- الاتجاه يضبط على عنصر `html`.
- استخدم `margin-inline-*`, `padding-inline-*`, `border-inline-*`, `inset-inline-*`.
- لا تعكس الشعار أو أيقونات الحالة.
- اعكس الأسهم والأيقونات الاتجاهية فقط.
- اختبر كل شاشة في AR وEN، Light وDark.

---

## 17. التحقق والاختبارات

### 17.1 Unit tests

اختبر الدوال النقية:

- `getSplashProgress` لكل حالة.
- تحويل Bootstrap status إلى BootStep states.
- Retry policy والـ backoff.
- health level transitions.
- resolve error code إلى رسالة مترجمة.

### 17.2 Component tests

- Splash تعرض الاسم والـ progress والـ steps.
- Progressbar تحمل قيم ARIA الصحيحة.
- Error screen تعرض fallback عند غياب الرسالة.
- Retry يشغل callback مرة واحدة.
- HealthBlocker يظهر عند `critical` ويختفي عند `healthy`.
- التفاصيل الاختيارية لا تكسر layout عند النص الطويل.

### 17.3 Browser checks

اختبر فعلياً:

1. فتح التطبيق لأول مرة.
2. Refresh على رابط داخلي.
3. Backend شغال: Splash → Auth/Home.
4. Backend متوقف: HealthBlocker.
5. عودة Backend: رفع الحجب تلقائياً.
6. فشل bootstrap: Error screen ثم Retry.
7. تبديل اللغة أثناء التشغيل.
8. Light/Dark.
9. أحجام صغيرة ومتوسطة وكبيرة.
10. Keyboard navigation وfocus-visible.
11. `prefers-reduced-motion`.

### 17.4 أوامر الجودة

نفذ حسب Scripts المشروع الجديد:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

أي خطة تنفيذ تعتبر غير مكتملة لو لم يتم التحقق من السلوك في المتصفح، مش compilation فقط.

---

## 18. Definition of Done

- [ ] Splash مرتبطة بـ Bootstrap state machine حقيقية.
- [ ] progress والـ ring والـ steps متزامنين.
- [ ] لا يوجد timeout مستقل يحسم نجاح الإقلاع.
- [ ] BootstrapErrorScreen تعرض Retry موثوقاً.
- [ ] HealthBlocker يغطي كل الشاشات عند `critical`.
- [ ] Runtime health polling متكيف ويتوقف عند إخفاء التاب.
- [ ] رجوع الخدمة يرفع الحجب ويكمل التدفق الصحيح.
- [ ] ScreenLayout موحد ويقرأ الحالة الحية.
- [ ] النصوص مترجمة بالكامل AR/EN.
- [ ] RTL/LTR وLight/Dark مختبرين.
- [ ] Accessibility مكتملة: labels، roles، focus، keyboard.
- [ ] motion يحترم reduced motion.
- [ ] الألوان والقياسات مبنية على tokens.
- [ ] اختبارات unit/component/browser ناجحة.
- [ ] التوثيق وسجل الجلسة والتغييرات محدثين.

---

## 19. ترتيب التنفيذ المقترح في المشروع الجديد

### المرحلة 1 — الأساس

1. تعريف Design Tokens والـ typography.
2. إنشاء AppBackground وLogo وScreenLayout.
3. إنشاء SystemStatusBar.
4. إنشاء i18n keys الأساسية.

### المرحلة 2 — الإقلاع

1. تعريف `BootstrapStatus`.
2. كتابة `retry-policy`.
3. كتابة `bootstrap-orchestrator`.
4. كتابة `getSplashProgress`.
5. بناء SplashScreen وBootStepList وProgressRing.
6. ربط الشاشة بالحالة الحقيقية.

### المرحلة 3 — الأخطاء والاستعادة

1. تعريف error envelope وhealth model.
2. بناء BootstrapErrorScreen.
3. بناء SmartButton/RetryButton.
4. بناء RuntimeHealthMonitor.
5. بناء HealthBlocker.
6. ربط المراقب بجذر التطبيق.

### المرحلة 4 — الجودة

1. إضافة unit tests.
2. إضافة component tests.
3. تنفيذ browser checks.
4. مراجعة RTL/LTR وLight/Dark.
5. مراجعة reduced motion وkeyboard.
6. تشغيل typecheck/lint/test/build.

### المرحلة 5 — الصقل

1. ضبط المسافات والتباين.
2. تقليل أي حركة غير وظيفية.
3. مراجعة النصوص والترجمة.
4. التأكد من عدم وجود race conditions في Retry/Refresh.
5. تحديث التوثيق النهائي.

---

## 20. أخطاء شائعة ممنوع تتكرر

- ربط الانتقال بـ `setTimeout` بدل نتيجة bootstrap.
- عرض progress لا يعكس state الحقيقي.
- وضع fetch داخل SplashScreen.
- retry لا نهائي أو زر يرسل طلبات متزامنة.
- عرض Stack Trace أو رسالة Backend خام للمستخدم.
- إخفاء Focus Ring.
- استخدام اللون وحده للدلالة على الخطأ.
- استخدام `left/right` بدل الخصائص المنطقية.
- تجاهل RTL أو اختبار لغة واحدة فقط.
- ترك Canvas شغالاً في الخلفية عند إخفاء التاب.
- تركيب Health Monitor داخل شاشة واحدة فقط.
- اعتبار فشل refresh للجلسة فشل Backend.
- استخدام ألوان أو قياسات hardcoded داخل المكونات.

---

## 21. خلاصة العقد القابل للنقل

لو هتنقل النظام لمشروع جديد، احتفظ بالثوابت دي حتى لو غيرت الـ framework أو أسماء الملفات:

1. State machine واضحة للإقلاع.
2. Orchestrator مستقل عن الواجهة.
3. Splash صادقة في عرض التقدم.
4. Error screen قابلة للاستعادة.
5. Runtime health blocker فوق كل الشاشات.
6. Layout وStatusBar موحدين.
7. Tokens مركزية وثيمات واتجاهات كاملة.
8. Accessibility وi18n جزء من العقد، مش تحسين لاحق.
9. Retry آمن ضد الضغط المكرر.
10. Tests تغطي الحالات الطبيعية، الفشل، والاستعادة.
