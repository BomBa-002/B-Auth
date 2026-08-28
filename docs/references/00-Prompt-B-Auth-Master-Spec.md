# Prompt.md — B-Auth Universal Modular Architecture

## 1. الدور — Role

أنت Senior Software Engineer + Software Architect متخصص في:

- Node.js + Express + TypeScript
- React 19
- Vite 6
- Tailwind CSS
- shadcn/ui
- Modular Architecture
- Monorepo Architecture
- Authentication & Authorization
- Docker / Docker Compose
- MinIO
- Frontend Architecture & Design Systems

مهمتك تنفيذ مشروع باسم:

```text
B-Auth
```

كنظام Authentication & Authorization احترافي وقابل لإعادة الاستخدام في مشاريع متعددة.

الهدف ليس فقط تشغيل Login، وإنما بناء Foundation واضحة وقابلة للتوسع والتعلم وإضافة تطبيقات Frontend أخرى مستقبلًا بدون نسخ Infrastructure والإعدادات المشتركة.

---

# 2. المبادئ الأساسية

يجب أن يكون المشروع:

- Modular
- Type-Safe
- Reusable
- Maintainable
- Scalable
- Dockerized
- Learning Friendly
- Feature-Oriented
- مناسبًا ليكون Project Template
- قليل الاقتران Coupling بين الموديولات
- واضح الاتجاه في Dependencies

تجنب:

- God Files
- God Services
- Circular Dependencies
- Business Logic داخل Routes
- Business Logic داخل React Components
- نسخ Configurations بين التطبيقات
- استخدام `any` دون ضرورة موثقة
- Abstractions غير ضرورية

---

# 3. Technology Stack

## Backend

استخدم:

```text
Node.js
Express
TypeScript
Zod
bcrypt
JWT
json-server / JSON Data Source
MinIO
Multer
express-fileupload
```

يكون Express هو Application Backend الحقيقي.

`json-server / JSON` هو Data Source للنسخة الحالية، وليس Authentication Server.

---

## Frontend

استخدم:

```text
React 19
Vite 6
TypeScript
Tailwind CSS
shadcn/ui
```

بالإضافة إلى المكتبات المحددة لاحقًا.

---

## DevOps

استخدم:

```text
Docker
Docker Compose
```

---

# 4. Universal Shared Architecture

هذه متطلبات أساسية وليست Optional.

لا تكرر الإعدادات العامة بين Frontend Applications.

أنشئ Shared Packages مستقلة على مستوى Root للمشروع.

البنية المستهدفة:

```text
B-Auth/
├── Backend/
├── Frontend/
│
├── packages/
│   ├── design-system/
│   ├── theme/
│   ├── aliases/
│   └── utils/
│
├── docs/
├── docker/
├── docker-compose.yml
├── package.json
└── README.md
```

صمم Root project على شكل npm workspaces خفيف بدون إضافة Monorepo Framework ثقيل مثل Nx أو Turborepo ما لم توجد ضرورة حقيقية.

مثال:

```json
{
  "workspaces": [
    "Backend",
    "Frontend",
    "packages/*"
  ]
}
```

الهدف أن تستطيع التطبيقات الحالية والمستقبلية استهلاك Packages المشتركة كـ Workspace Packages.

---

# 5. Universal Design System

أنشئ Package مستقلة مثل:

```text
packages/design-system/
```

تكون مسؤولة عن الإعدادات والتعريفات المشتركة الخاصة بالـ Design System.

يجب أن توفر Tailwind configuration مشتركة يمكن لكل Frontend Application أن ترث منها.

مثال Conceptual:

```text
packages/design-system/
├── src/
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

ثم يكون إعداد التطبيق المحلي Thin Configuration يقوم بعمل extend للإعداد العالمي فقط عند الحاجة.

مثلًا:

```text
Frontend/tailwind.config.ts
        │
        ▼
packages/design-system/tailwind.config.ts
```

وحّد قدر الإمكان:

```text
Colors
Spacing conventions
Typography
Border radius
Breakpoints
Animations
Container configuration
Shared Tailwind plugins
Design tokens integration
```

لا تجعل التطبيقات تنسخ Tailwind configuration يدويًا.

مع مراعاة توافق طريقة الإعداد الفعلية مع نسخة Tailwind المثبتة؛ إذا كانت النسخة المستخدمة تعتمد CSS-first configuration بدل `tailwind.config.ts` التقليدي، حافظ على نفس هدف الـ Universal Design System باستخدام الآلية الرسمية للنسخة، ووثّق ذلك بدل فرض Config API غير متوافقة.

---

# 6. Universal Theme System

أنشئ:

```text
packages/theme/
```

ليحتوي على:

```text
theme.config.ts
```

ويكون المصدر المركزي للـ Theme.

يجب أن يدعم على الأقل:

```text
Light Theme
Dark Theme
System Theme
```

وصمم Theme API تسمح بالتوسع مستقبلًا لأكثر من Brand/Theme.

وحّد Design Tokens مثل:

```text
primary
secondary
background
foreground
muted
accent
destructive
border
input
ring
radius
```

يجب ألا تحتوي كل Application على Theme definitions مستقلة إلا إذا كانت Override لتطبيق محدد.

اجعل التكامل مع:

```text
Tailwind
shadcn/ui
CSS Variables
```

منظمًا وواضحًا.

---

# 7. Universal Alias System

أنشئ Package:

```text
packages/aliases/
```

تحتوي على:

```text
alias.config.ts
```

الهدف هو تعريف Alias conventions مركزيًا.

مثل:

```text
@app/*
@components/*
@features/*
@services/*
@hooks/*
@lib/*
@types/*
@shared/*
```

يجب الحفاظ على التوافق بين:

```text
TypeScript
Vite
IDE resolution
Testing tools مستقبلًا
```

لا تنسخ Alias definitions يدويًا في عدة أماكن إذا كان بالإمكان توليدها أو استيراد مصدر موحد.

وثّق أي قيود تقنية؛ TypeScript وVite قد يحتاجان representations مختلفة، ولذلك يجب أن يكون `alias.config.ts` مصدر الحقيقة الذي تُشتق منه الإعدادات عند الإمكان، وليس افتراض أن كل أداة تقرأ الشكل نفسه مباشرة.

---

# 8. Universal Utils System

أنشئ:

```text
packages/utils/
```

لـ reusable utilities المشتركة بين التطبيقات.

مثل:

```text
cn()
date helpers
formatting helpers
safe storage helpers
string helpers
object helpers
```

استخدم:

```text
clsx
tailwind-merge
dayjs
```

حيث تكون مناسبة.

مثال:

```ts
cn("px-2", condition && "bg-primary")
```

لا تضع Business Logic خاصًا بـ Auth أو Users داخل Universal Utils.

الـ Utils يجب أن تكون:

```text
Generic
Reusable
Framework-light where possible
Side-effect free where appropriate
```

---

# 9. Business Modules

كل Business Module في Backend يجب أن يكون مستقلًا قدر الإمكان.

مثال:

```text
Backend/src/modules/users/
├── user.routes.ts
├── user.schema.ts
├── user.service.ts
├── user.repository.ts
└── user.types.ts
```

الموديولات الأساسية:

```text
modules/
├── auth/
├── users/
├── roles/
├── permissions/
└── storage/
```

يمكن إضافة ملفات داخل الموديول مثل:

```text
user.controller.ts
user.mapper.ts
user.constants.ts
user.errors.ts
```

فقط عندما تقدم قيمة معمارية واضحة.

---

# 10. Backend Layers

اتجاه Dependencies الأساسي:

```text
HTTP
 │
 ▼
Routes
 │
 ▼
Validation
 │
 ▼
Service
 │
 ▼
Repository
 │
 ▼
Data Source
```

## Routes

مسؤولة عن:

```text
Routes
HTTP input/output
Middleware composition
```

ولا تحتوي Business Logic.

## Schema

استخدم Zod من أجل:

```text
Request validation
Input schemas
Type inference
```

## Service

مسؤول عن:

```text
Business Logic
Business Rules
Use Cases
Orchestration
```

لا يعتمد مباشرة على Express `Request` أو `Response`.

## Repository

مسؤول عن:

```text
Persistence
Queries
Data Source access
```

يجب ألا يصل Service مباشرة إلى `db.json`.

## Types

ضع Types الخاصة بالموديول في ملفات واضحة.

---

# 11. Authentication

يدعم Login:

```text
username
email
phone
```

من خلال حقل واحد:

```text
identifier
```

Endpoint:

```http
POST /api/auth/login
```

Request:

```json
{
  "identifier": "admin@example.com",
  "password": "Admin123!"
}
```

البحث:

```text
username === identifier
OR
email === identifier
OR
phone === identifier
```

استخدم bcrypt للتحقق من Password Hash.

ممنوع تخزين Password كـ Plain Text.

---

# 12. Auth API

أنشئ:

```text
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

ويكون Auth Module مستقلًا عن Users Module قدر الإمكان.

---

# 13. Token Architecture

استخدم:

```text
Access Token
Refresh Token
```

لا تخزن Refresh Token في:

```text
localStorage
```

استخدم Cookie:

```text
HttpOnly
Secure in production
SameSite
```

تعامل بشكل صحيح مع:

```text
CORS
Credentials
Token expiration
Refresh
Logout
```

ولا تسجل Tokens في Logs.

---

# 14. RBAC

استخدم:

```text
User
  │
  ▼
Role
  │
  ▼
Permission
```

مثال:

```text
users.read
users.create
users.update
users.delete
```

اجعل Backend المصدر الحقيقي للـ Authorization.

إخفاء زر في Frontend ليس Authorization Security.

---

# 15. Frontend Feature Architecture

اعتمد Feature-Oriented Architecture.

مثال:

```text
Frontend/src/
├── app/
│   ├── providers/
│   ├── router/
│   └── styles/
│
├── components/
├── features/
│   └── auth/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── schemas/
│       ├── store/
│       └── types/
│
├── pages/
│   ├── LoginScreen.tsx
│   └── HomeScreen.tsx
│
├── services/
├── hooks/
├── lib/
└── types/
```

لا تجعل كل Shared logic يتجمع عشوائيًا في:

```text
components/
utils/
services/
```

حدد Ownership واضح لكل Feature.

---

# 16. i18n

استخدم:

```text
i18next
react-i18next
```

ادعم من البداية:

```text
English:
  locale: en
  direction: ltr
  default: true

Arabic:
  locale: ar
  direction: rtl
```

يجب أن يكون تغيير اللغة Runtime بدون Reload غير ضروري.

عند تغيير اللغة حدث:

```text
document.documentElement.lang
document.documentElement.dir
```

ليكون:

```html
<html lang="en" dir="ltr">
```

أو:

```html
<html lang="ar" dir="rtl">
```

قسم ملفات الترجمة إلى Namespaces منطقية عند الحاجة، مثل:

```text
common
auth
errors
validation
```

لا تضع النصوص الأساسية Hardcoded داخل Components.

استخدم لغة افتراضية:

```text
en
```

وفّر Language Switcher بسيط.

احفظ Preference بشكل آمن ومناسب على Client.

---

# 17. Routing

استخدم حصريًا:

```text
@tanstack/react-router
```

لـ SPA Routing.

لا تستخدم React Router.

أنشئ Routing architecture تدعم:

```text
Public Routes
Protected Routes
Authentication Guards
Not Found
Future Permission Guards
```

Routes الأساسية:

```text
/login
/
```

بحيث `/` تقود إلى HomeScreen للمستخدم Authenticated.

تعامل مع حالة Initial Auth Loading بشكل صحيح لمنع:

```text
Redirect flicker
Unauthorized UI flash
```

---

# 18. Client State

استخدم:

```text
zustand
persist middleware
```

لـ Client-only State.

أمثلة:

```text
Theme preference
Language preference
UI state
Sidebar state مستقبلًا
Non-sensitive preferences
```

لا تستخدم Zustand كبديل لـ React Query لحفظ Server Data.

لا تخزن:

```text
Refresh Token
Passwords
Sensitive credentials
```

داخل Zustand Persist.

استخدم:

```text
localStorage
```

أو:

```text
sessionStorage
```

فقط للبيانات المناسبة لذلك.

---

# 19. Server State

استخدم:

```text
@tanstack/react-query
```

لإدارة بيانات Backend.

يكون مسؤولًا عن:

```text
Queries
Mutations
Caching
Retries
Invalidate
Refetch
Pagination
Loading states
Error states
```

أنشئ:

```text
QueryClient
QueryClientProvider
```

في App Provider Layer.

ضع Query Keys بشكل منظم وقابل لإعادة الاستخدام.

لا تكرر Server State داخل Zustand بدون سبب.

---

# 20. HTTP Client

استخدم:

```text
axios
```

أنشئ HTTP Client مركزيًا.

يجب أن يدعم:

```text
baseURL
withCredentials
request interceptors
response interceptors
normalized errors
refresh token flow
```

طبق Refresh Token flow باحترافية.

يجب التعامل مع Concurrent `401` Responses بطريقة تمنع إرسال عدة Refresh Requests متزامنة بشكل غير منضبط.

بعد نجاح Refresh:

```text
Retry failed requests
```

إذا فشل Refresh بشكل نهائي:

```text
Clear auth client state
Redirect/transition to Login
```

بدون Infinite Retry Loop.

تجنب إنشاء Circular Dependency بين:

```text
Axios
Auth Store
Router
```

صمم التكامل بطريقة واضحة.

---

# 21. Forms

استخدم:

```text
react-hook-form
```

لإدارة النماذج.

في Login Form استخدم:

```text
react-hook-form
+
zod
+
@hookform/resolvers
```

بحيث يكون Zod هو Schema Source.

لا تكرر Validation Rules يدويًا في أماكن متعددة.

---

# 22. Frontend Validation

استخدم:

```text
zod
```

لـ:

```text
Forms
Client validation
Environment validation where useful
External API boundary validation where justified
```

استفد من:

```ts
z.infer<typeof schema>
```

بدل تكرار Types يدويًا بدون حاجة.

---

# 23. Tables

استخدم:

```text
@tanstack/react-table
```

كأساس لأي Data Tables مستقبلية.

يجب أن تكون البنية قادرة على دعم:

```text
Sorting
Filtering
Pagination
Column visibility
Row selection
```

لا حاجة لبناء Users Management Table كاملة في Milestone الأولى.

أنشئ Foundation فقط إذا كانت ستستخدم فعليًا، ولا تضف Dead Code.

---

# 24. Dates

استخدم:

```text
dayjs
```

لتنسيق ومعالجة التواريخ.

ضع Generic Date Helpers المناسبة داخل:

```text
packages/utils/
```

وتجنب الاعتماد العشوائي على `new Date()` formatting داخل Components.

راعِ إمكانية Locale-aware formatting.

---

# 25. Class Helpers

استخدم:

```text
clsx
tailwind-merge
```

وأنشئ Utility موحدة:

```ts
cn()
```

داخل Universal Utils Package.

يجب أن تستخدم Components المشتركة هذه Utility بدل إعادة تنفيذها في كل Application.

---

# 26. Icons

استخدم:

```text
lucide-react
```

للأيقونات.

تجنب إضافة Icon Libraries أخرى بدون ضرورة.

---

# 27. Animation

استخدم:

```text
framer-motion
```

للحركات عند الحاجة.

أمثلة:

```text
Dialogs
Page transitions
Dropdown transitions
Feedback
```

لا تضف Animations مزعجة أو غير ضرورية.

احترم:

```text
prefers-reduced-motion
```

حيثما يكون مناسبًا.

---

# 28. React File Upload

استخدم:

```text
react-dropzone
```

لواجهات رفع الملفات.

يجب أن يدعم:

```text
Drag & Drop
File selection
Client-side validation
Accepted MIME types
Max size
Feedback
```

Client-side validation لا تستبدل Backend validation.

---

# 29. Backend File Upload

المكتبات المطلوبة:

```text
multer
express-fileupload
```

لكن لا تستخدم الاثنتين لمعالجة نفس Upload Request Pipeline في الوقت نفسه.

أنشئ Storage/Upload abstraction تسمح باستخدام Adapter واحد.

اجعل:

```text
Multer
```

هو Default Upload Adapter.

ويكون:

```text
express-fileupload
```

متاحًا كبديل إذا احتاج مشروع مشتق منه لاحقًا.

تجنب Global `express-fileupload` middleware إذا كانت الـ endpoints الفعلية تعتمد Multer.

وفر Validation للـ:

```text
MIME type
File size
File count
Generated object name
```

ولا تثق في Client filename أو MIME بشكل أعمى.

---

# 30. MinIO Storage

أنشئ:

```text
Backend/src/modules/storage/
```

وافصل MinIO implementation خلف Storage Service / Adapter.

لا تجعل Business Modules الأخرى تستخدم MinIO SDK مباشرة.

يكون التدفق:

```text
React Dropzone
      │
      ▼
Axios
      │
      ▼
Express
      │
      ▼
Auth / Authorization
      │
      ▼
Multer
      │
      ▼
Storage Service
      │
      ▼
MinIO Adapter
      │
      ▼
MinIO
```

Credentials لا تصل إلى Frontend.

---

# 31. Drag & Drop

استخدم مكتبات `dnd-kit` الرسمية المناسبة للاستخدام الفعلي، مثل:

```text
@dnd-kit/core
@dnd-kit/sortable
@dnd-kit/utilities
```

عند بناء Features تحتاج:

```text
Sortable lists
Kanban
Reordering
Drag & Drop
```

لا تضف Demo غير مستخدم في Milestone الأولى فقط لإثبات وجود المكتبة.

---

# 32. Charts

جهّز Dependency واحدة فقط للرسوم البيانية.

استخدم افتراضيًا:

```text
recharts
```

ولا تثبت:

```text
chart.js
react-chartjs-2
```

معها بلا حاجة.

يمكن استخدامها مستقبلًا للـ Dashboard والإحصائيات.

لا حاجة لإنشاء Dashboard Charts في المرحلة الأولى.

---

# 33. Error Tracking

جهّز المشروع لدعم Sentry باستخدام الحزمة الرسمية المناسبة للـ React/Vite والـ Node/Express عند تفعيلها.

اجعل Sentry اختياريًا بناءً على Environment Variables مثل:

```text
VITE_SENTRY_DSN
SENTRY_DSN
```

إذا لم يوجد DSN:

```text
Application must work normally
```

لا ترسل:

```text
Passwords
Tokens
Sensitive user data
Secrets
```

إلى Sentry.

فعّل Integration للإنتاج بشكل مناسب، ووثّق الإعداد بدل وضع DSN حقيقي داخل المشروع.

---

# 34. Dialog / Modal

استخدم:

```text
@radix-ui/react-dialog
```

مع Tailwind.

أو shadcn/ui Dialog إذا كان Wrapper مبنيًا عليه.

يجب دعم:

```text
Accessibility
Focus management
Keyboard navigation
ESC close
ARIA semantics
```

لا تبنِ Modal primitive يدويًا إذا كانت Radix توفر الحل المطلوب.

---

# 35. Toast Notifications

استخدم:

```text
sonner
```

للـ Toast Notifications.

استخدمها مثلًا في:

```text
Login feedback where appropriate
Logout feedback
API action success
API errors
Uploads
```

لا تستخدم Toast كبديل لرسائل Validation الموجودة بجانب Form Fields.

---

# 36. Tooltips

استخدم:

```text
@radix-ui/react-tooltip
```

أو shadcn/ui Tooltip المبني عليه.

استخدمه للأيقونات والإجراءات التي تحتاج توضيحًا.

راعِ Accessibility ولا تجعل المعلومات الأساسية متاحة فقط بالـ Hover.

---

# 37. User Model

يدعم على الأقل:

```text
id
username
email
phone
passwordHash
role / roles
isActive
createdAt
updatedAt
```

اختر بين:

```text
roleId
```

أو:

```text
roleIds[]
```

وفق أبسط تصميم يسمح بالتوسع لاحقًا، ووثق القرار.

لا ترسل:

```text
passwordHash
```

إلى Frontend مطلقًا.

---

# 38. Login Screen

أنشئ:

```text
LoginScreen.tsx
```

وتحتوي:

```text
Identifier
Password
Submit
Language Switcher
Theme Switcher إذا كان مناسبًا
```

استخدم:

```text
react-hook-form
zod
TanStack Query Mutation
Axios
i18next
shadcn/ui
Tailwind
sonner where appropriate
lucide-react where appropriate
```

الحالات المطلوبة:

```text
Idle
Loading
Validation Error
Authentication Error
Success
```

يجب أن تكون:

```text
Responsive
Accessible
LTR/RTL compatible
Simple
Clean
```

لا تبالغ في UI لأن التصميم سيعدل لاحقًا.

---

# 39. Home Screen

أنشئ:

```text
HomeScreen.tsx
```

وتحتوي فقط على:

```text
Welcome message
Current user basic information
Language control
Theme control
Logout
```

يجب أن تعمل بشكل صحيح في:

```text
en / LTR
ar / RTL
Light
Dark
```

---

# 40. Protected Routing

استخدم TanStack Router لبناء:

```text
Public Route
Protected Route
```

السلوك:

```text
Unauthenticated
      │
      ▼
/login

Authenticated
      │
      ▼
/
```

ويجب أن يستعيد التطبيق حالة المستخدم باستخدام:

```text
GET /api/auth/me
```

بدون الاعتماد على Zustand persisted `isAuthenticated` كحقيقة أمنية.

Backend Session/Token validation هي الحقيقة الأساسية.

---

# 41. Permission API

أنشئ Frontend abstraction تسمح باستخدام:

```ts
can("users.read")
```

أو تصميم مكافئ Type-Safe قدر الإمكان.

يمكن لاحقًا استخدامها في:

```text
Routes
Buttons
Menus
Actions
Tables
```

لكن Backend يعيد التحقق دائمًا من Permission.

---

# 42. App Providers

نظم Providers مركزيًا.

مثل:

```text
App
 │
 ▼
Error/Sentry Boundary
 │
 ▼
Query Provider
 │
 ▼
i18n
 │
 ▼
Theme
 │
 ▼
Tooltip
 │
 ▼
Router
 │
 ▼
Toaster
```

الترتيب الفعلي يحدد وفق احتياجات المكتبات.

لا تجعل `main.tsx` ملفًا ضخمًا.

يفضل:

```text
src/app/providers/
```

---

# 43. Error Handling

Backend يجب أن يحتوي على Central Error Handler.

نموذج Error:

```text
statusCode
code
message
details
```

مثال Response:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid credentials"
  }
}
```

Frontend يجب أن يحتوي على Error normalization واضحة.

لا تعرض Stack Traces للمستخدم.

---

# 44. Standard API Response

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

ابقِ التصميم بسيطًا ولا تنشئ Response Framework معقدًا.

---

# 45. Environment Configuration

استخدم Environment Variables مثل:

```text
NODE_ENV
PORT
FRONTEND_URL

JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN

MINIO_ENDPOINT
MINIO_PORT
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
MINIO_BUCKET

SENTRY_DSN

VITE_API_URL
VITE_SENTRY_DSN
```

أنشئ:

```text
.env.example
```

لكل Application عند الحاجة.

استخدم Zod للتحقق من Environment Variables المهمة عند Startup.

---

# 46. Docker

يجب أن يعمل المشروع من خلال:

```bash
docker compose up --build
```

على الأقل:

```text
Frontend
Backend
MinIO
```

استخدم:

```text
Volumes
Networks
Healthchecks
Service names
Environment Variables
```

عند الحاجة.

ممنوع استخدام:

```text
localhost
```

للاتصال Container-to-Container.

استخدم Docker service names.

---

# 47. Root Workspace

استخدم Root Workspace خفيفًا لإدارة:

```text
Backend
Frontend
packages/*
```

يفضل npm workspaces ما لم توجد ضرورة مختلفة.

يجب أن يدعم Root scripts مثل:

```bash
npm run dev
npm run build
npm run typecheck
npm run docker:up
npm run docker:down
```

اجعل Shared Packages قابلة للاستهلاك مثل:

```text
@b-auth/design-system
@b-auth/theme
@b-auth/aliases
@b-auth/utils
```

أو Naming Convention مماثلة ومتناسقة.

---

# 48. Shared Package Boundaries

اتبع تقريبًا:

```text
design-system
     │
     ├── Design/Tailwind configuration
     └── Design-system level primitives/config

theme
     │
     └── Theme configuration/tokens

aliases
     │
     └── Shared alias source/config

utils
     │
     └── Generic utilities
```

تجنب Circular Dependencies مثل:

```text
utils -> Frontend
theme -> Frontend
aliases -> Frontend
design-system -> specific feature
```

التطبيقات تعتمد على Shared Packages، وليس العكس:

```text
Shared Packages
      ▲
      │
Frontend Applications
```

---

# 49. Dependency Classification

استخدم المكتبة للمشكلة الصحيحة.

```text
Zustand
→ Client State

TanStack Query
→ Server State

Axios
→ HTTP

React Hook Form
→ Forms

Zod
→ Validation

TanStack Router
→ Routing

i18next
→ Translation

Dayjs
→ Dates

clsx + tailwind-merge
→ Classes

React Dropzone
→ File UI

Multer
→ Default backend upload parser

MinIO
→ Object storage

dnd-kit
→ Drag/drop

Recharts
→ Charts

Sentry
→ Error monitoring

Sonner
→ Toast

Radix
→ Accessible UI primitives
```

لا تستخدم أداة في مجال أداة أخرى بدون داعٍ.

---

# 50. Dependency Installation Policy

المكتبات المطلوبة للمشروع تشمل:

```text
i18next
react-i18next
@tanstack/react-router
zustand
@tanstack/react-query
axios
react-hook-form
@hookform/resolvers
zod
@tanstack/react-table
dayjs
clsx
tailwind-merge
lucide-react
framer-motion
react-dropzone
@dnd-kit/core
@dnd-kit/sortable
@dnd-kit/utilities
recharts
@radix-ui/react-dialog
@radix-ui/react-tooltip
sonner
```

Backend:

```text
express
zod
bcrypt
jsonwebtoken
multer
express-fileupload
minio
```

Sentry:

استخدم الحزم الرسمية الحديثة المناسبة للـ React وNode/Express بدل تثبيت Package قديمة أو Deprecated.

قبل تثبيت أي Package:

- تأكد من Compatibility مع React 19.
- تأكد من Compatibility مع Vite 6.
- لا تعتمد على Deprecated APIs.
- لا تثبت Packages مكررة تقوم بنفس الدور إلا إذا كانت مطلوبة كـ adapters بديلة.
- لا تكتب كودًا مبنيًا على API غير موجود في الإصدار المثبت.

---

# 51. Avoid Premature Implementation

وجود Dependency ضمن Stack لا يعني ضرورة بناء Demo خاص بها.

في Milestone الأولى:

يجب أن تستخدم فعليًا المكتبات اللازمة لـ:

```text
Authentication
Routing
HTTP
Server State
Forms
Validation
i18n
Theme
UI
Notifications
Utilities
```

أما:

```text
Tables
Charts
Drag & Drop
File Upload UI
Animations
```

فيمكن إعداد Dependencies/Foundation الخاصة بها بدون إنشاء Features وهمية لمجرد استخدامها.

لا تضف Dead Code.

---

# 52. Seed Data

أنشئ Admin User تجريبي.

مثال Development:

```text
username: admin
password: Admin123!
```

Database يجب أن تحتوي Hash وليس Password Plain Text.

وثق Development Credentials في README.

---

# 53. Security

طبق على الأقل:

- Password hashing.
- HttpOnly Refresh Cookie.
- Secure production cookies.
- CORS allowlist.
- Zod validation.
- Backend RBAC.
- Generic login errors.
- Upload size restrictions.
- MIME restrictions.
- Environment validation.
- No secrets in Git.
- No tokens/passwords in logs.
- No `passwordHash` in API responses.
- Helmet عند ملاءمته.
- Refresh-token abuse/replay considerations موثقة.
- No client-side authorization trust.

لا تستخدم Zustand persistence لتخزين Security Tokens الحساسة.

---

# 54. Documentation

أنشئ:

```text
docs/
├── architecture.md
├── frontend-architecture.md
├── shared-packages.md
├── design-system.md
├── theme-system.md
├── alias-system.md
├── authentication.md
├── authorization.md
├── i18n.md
├── api.md
└── storage.md
```

اشرح:

```text
Architecture
Dependency direction
Module boundaries
Universal packages
Auth flow
Refresh flow
RBAC
RTL/LTR
Theme handling
State management responsibilities
Docker topology
Storage flow
```

---

# 55. Target Structure

الهيكل النهائي المتوقع قريب من:

```text
B-Auth/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── permissions/
│   │   │   └── storage/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── db/
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── providers/
│   │   │   ├── router/
│   │   │   └── styles/
│   │   ├── components/
│   │   ├── features/
│   │   │   └── auth/
│   │   ├── i18n/
│   │   ├── pages/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── HomeScreen.tsx
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── packages/
│   ├── design-system/
│   │   ├── src/
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   ├── theme/
│   │   ├── src/
│   │   ├── theme.config.ts
│   │   └── package.json
│   │
│   ├── aliases/
│   │   ├── src/
│   │   ├── alias.config.ts
│   │   └── package.json
│   │
│   └── utils/
│       ├── src/
│       │   ├── cn.ts
│       │   ├── date.ts
│       │   └── index.ts
│       └── package.json
│
├── docs/
├── docker/
├── docker-compose.yml
├── package.json
└── README.md
```

هذا الهيكل Guideline وليس سببًا لفرض ملفات فارغة.

---

# 56. Milestone الأولى

ركز أولًا على End-to-End Flow:

```text
Docker
   │
   ▼
Backend
   │
   ▼
Seed Admin
   │
   ▼
Frontend
   │
   ▼
i18n + Theme
   │
   ▼
Login Form
   │
   ▼
Axios
   │
   ▼
React Query Mutation
   │
   ▼
POST /auth/login
   │
   ▼
Auth established
   │
   ▼
TanStack Router
   │
   ▼
Protected Route
   │
   ▼
GET /auth/me
   │
   ▼
HomeScreen
   │
   ▼
Logout
```

ويجب اختبار:

```text
English + LTR
Arabic + RTL
Light
Dark
Refresh
Logout
Invalid login
Protected route
Expired access token / refresh flow
```

---

# 57. أسلوب التنفيذ

قبل تنفيذ أي شيء:

1. افحص Repository الحالي.
2. افهم الملفات الموجودة.
3. لا تحذف كودًا قائمًا بدون مبرر.
4. راجع إصدارات Packages الفعلية.
5. تحقق من Compatibility.
6. اعرض خطة تنفيذ مختصرة.
7. ابدأ التنفيذ الفعلي.

لا تعطِ مجرد أمثلة.

نفذ الملفات الحقيقية.

لا تستخدم Pseudo-code عندما يمكن كتابة Implementation حقيقي.

---

# 58. Verification

بعد التنفيذ شغّل، حسب إمكانات البيئة:

```bash
npm install
npm run typecheck
npm run build
```

ثم:

```bash
docker compose config
docker compose up --build
```

تحقق من:

```text
Frontend starts
Backend starts
MinIO starts
Shared packages resolve
Aliases resolve
Tailwind works
Theme works
Dark/Light works
English works
Arabic RTL works
Login works
/auth/me works
Refresh works
Protected route works
Logout works
Build has no TypeScript errors
```

اختبر أيضًا أن Workspace Packages يمكن استيرادها فعليًا من Frontend، وليس مجرد وجودها كملفات.

---

# 59. معايير القبول

لا تعتبر المهمة مكتملة إذا كان هناك:

```text
Broken imports
TypeScript errors
Unresolved aliases
Circular dependencies مؤثرة
Invalid Tailwind config
Invalid Docker config
Refresh infinite loop
RTL broken layout
Passwords stored in plain text
Secrets committed
Protected route bypass
Business logic inside route handlers
Duplicated universal configuration
```

أصلح المشاكل قبل التقرير النهائي قدر الإمكان.

---

# 60. التقرير النهائي

بعد التنفيذ قدم تقريرًا مختصرًا يوضح:

- ما تم إنشاؤه.
- Project Tree النهائي.
- Shared Packages.
- Design System.
- Theme System.
- Alias System.
- Utils System.
- Backend Modules.
- Frontend Features.
- Authentication flow.
- Refresh Token flow.
- State management strategy.
- i18n + RTL implementation.
- Docker architecture.
- Build/Test results.
- Development credentials.
- المشاكل أو القيود المتبقية.
- الخطوة التالية المقترحة.

---

# 61. قاعدة معمارية نهائية

عند اتخاذ أي قرار، حافظ على هذه المعادلة:

```text
Shared Infrastructure
        +
Independent Business Modules
        +
Feature-Oriented Frontend
        +
Strict Dependency Boundaries
        +
Type Safety
        +
Security
        +
Practical Simplicity
        =
B-Auth
```

لا تحوّل المشروع إلى Framework معقد.

نريد Template يمكن فهمه وتعديله وإعادة استخدامه بسهولة.

ابدأ الآن بفحص المشروع الحالي، ثم اعرض خطة قصيرة، وبعد ذلك نفذ Milestone الأولى فعليًا.

---

# 62. Application Bootstrap / Splash Screen

أضف شاشة افتتاحية:

```text
SplashScreen.tsx
```

لا تجعلها مجرد Animation أو Timer ثابت.

وظيفتها الأساسية هي تهيئة التطبيق والتحقق من جاهزية الخدمات المطلوبة قبل الانتقال إلى:

```text
LoginScreen
```

أو:

```text
HomeScreen
```

حسب حالة Authentication.

يكون Startup Flow:

```text
Browser
   │
   ▼
SplashScreen
   │
   ▼
Application Bootstrap
   │
   ├── Load Environment / Runtime Configuration
   ├── Initialize Theme
   ├── Initialize Language + LTR/RTL
   ├── Initialize Sentry if configured
   ├── Initialize Query Client
   │
   ▼
Backend Health Check
   │
   ▼
System Readiness Check
   │
   ├── Backend API
   ├── Data Source
   └── Required backend infrastructure
   │
   ▼
Authentication Bootstrap
   │
   ├── /auth/me
   └── Refresh when required
   │
   ▼
Routing Decision
   │
   ├── Authenticated ──> HomeScreen
   │
   └── Unauthenticated ──> LoginScreen
```

---

# 63. Backend Health & Readiness

أنشئ Health Module مستقلًا قدر الإمكان، مثل:

```text
Backend/src/modules/health/
├── health.routes.ts
├── health.service.ts
├── health.types.ts
└── health.schema.ts
```

لا تضع Health Check logic داخل:

```text
server.ts
```

وفر Endpoints واضحة، ويفضل الفصل بين:

```http
GET /api/health/live
GET /api/health/ready
```

بحيث:

```text
/live
```

يجيب عن السؤال:

```text
هل عملية Backend نفسها تعمل؟
```

و:

```text
/ready
```

يجيب عن السؤال:

```text
هل Backend جاهز فعليًا لاستقبال طلبات التطبيق؟
```

يمكن لـ Readiness التحقق من الخدمات الضرورية مثل:

```text
Data Source
Required configuration
Required internal services
```

لا تجعل فشل خدمة اختيارية مثل Sentry يمنع تشغيل التطبيق.

بالنسبة لـ MinIO، اعتبره Dependency إلزامية للـ readiness فقط إذا كان التطبيق الحالي لا يستطيع أداء وظائفه الأساسية بدونه. وإلا أظهر حالته كـ degraded/optional dependency بدل إسقاط النظام بالكامل.

---

# 64. Health Response

استخدم Response واضحًا وقابلًا للتوسع.

مثال:

```json
{
  "success": true,
  "data": {
    "status": "ready",
    "timestamp": "2026-08-26T10:00:00.000Z",
    "services": {
      "api": "up",
      "dataSource": "up",
      "storage": "up"
    }
  }
}
```

لا تعرض في Health Endpoint العام:

```text
Secrets
Credentials
Internal paths
Connection strings
Stack traces
Sensitive infrastructure information
```

يمكن تبسيط التفاصيل المعادة في Production إذا كانت المعلومات مفيدة للمهاجم أكثر من المستخدم.

---

# 65. Docker Health Checks

اربط Docker Health Checks بالـ Backend Health architecture.

استخدم Endpoint مناسبًا مثل:

```text
/api/health/live
```

أو readiness endpoint عندما يكون ذلك منطقيًا.

استخدم:

```text
healthcheck
depends_on
service_healthy
```

حيثما تدعمها بيئة Docker Compose وتقدم فائدة فعلية.

لا تعتمد SplashScreen كبديل لـ Docker health checks.

يوجد مستويان مستقلان:

```text
Infrastructure Health
        │
        └── Docker

Application Bootstrap Health
        │
        └── Frontend
```

---

# 66. Splash Screen UI

يجب أن تكون:

```text
Simple
Clean
Responsive
Accessible
Theme-aware
LTR/RTL compatible
```

استخدم Branding بسيطًا لـ:

```text
B-Auth
```

مع:

```text
Logo / App Name
Loading indicator
Initialization status
```

يمكن استخدام:

```text
framer-motion
```

لحركة بسيطة وغير مزعجة.

احترم:

```text
prefers-reduced-motion
```

لا تستخدم Artificial Delay لإجبار المستخدم على مشاهدة SplashScreen.

إذا انتهت التهيئة بسرعة، انتقل مباشرة.

---

# 67. Bootstrap State Machine

لا تدير Startup logic بمجموعة Booleans عشوائية مثل:

```text
isLoading
isChecking
isReady
hasError
isAuthLoading
```

صمم Bootstrap State واضحة، مثل:

```ts
type BootstrapStatus =
  | "initializing"
  | "checking-server"
  | "checking-system"
  | "restoring-session"
  | "ready"
  | "unavailable";
```

يمكن أن تحتوي على معلومات إضافية مثل:

```text
currentStep
error
retryCount
lastCheckedAt
```

أبقِ هذه الحالة Client State إذا احتاجت ذلك، بينما HTTP health request نفسه يمكن أن يدار عبر Query/Service مناسب.

---

# 68. Server Unavailable Screen

إذا فشل الاتصال بالـ Backend، لا تنتقل مباشرة إلى LoginScreen وكأن بيانات المستخدم غير صحيحة.

يجب التمييز بين:

```text
Unauthenticated
```

و:

```text
Backend Unavailable
```

إذا كان Backend غير متاح، اعرض داخل Splash/Recovery UI:

```text
تعذر الاتصال بالخادم
```

وبالإنجليزية:

```text
Unable to connect to the server
```

مع زر:

```text
Retry
```

استخدم Translation Keys وليس Hardcoded text.

مثال:

```text
system.serverUnavailable
system.retry
system.checkingServer
system.initializing
```

---

# 69. Startup Retry Strategy

عند فشل Health Check:

استخدم Retry Strategy محدودة ومعقولة.

مثال:

```text
Attempt 1
   │
   ▼
Short delay
   │
   ▼
Attempt 2
   │
   ▼
Backoff
   │
   ▼
Attempt 3
   │
   ▼
Show Recovery UI
```

لا تنشئ Infinite Retry Loop.

عند الضغط على:

```text
Retry
```

أعد Bootstrap/Health Check بطريقة نظيفة.

لا تجعل Axios Refresh Interceptor يتعامل مع Health Endpoints وكأنها Authentication Requests.

---

# 70. Authentication Bootstrap

بعد نجاح Backend Readiness:

تحقق من Session الحالية.

يكون التدفق:

```text
Backend Ready
     │
     ▼
Check current authentication
     │
     ├── Valid Access Session
     │       │
     │       ▼
     │     /auth/me
     │       │
     │       ▼
     │    HomeScreen
     │
     ├── Access expired + Refresh available
     │       │
     │       ▼
     │    /auth/refresh
     │       │
     │       ▼
     │    /auth/me
     │       │
     │       ▼
     │    HomeScreen
     │
     └── No valid session
             │
             ▼
          LoginScreen
```

لا تعرض LoginScreen للحظة قبل اكتمال Authentication Bootstrap.

الهدف هو منع:

```text
Login flicker
Incorrect redirect
HomeScreen flash
```

---

# 71. Remember Me

أضف خاصية:

```text
Remember Me
```

إلى LoginScreen.

الواجهة تحتوي على Checkbox مثل:

```text
☐ Remember me
```

مع Translation كاملة:

```text
en:
Remember me

ar:
تذكرني
```

يجب أن تعمل بشكل صحيح في:

```text
LTR
RTL
```

واستخدم Component متوافقًا مع Accessibility، ويفضل shadcn/Radix primitive المناسب.

---

# 72. Remember Me Security Model

ممنوع تنفيذ Remember Me عن طريق تخزين:

```text
Password
Refresh Token
Authentication credentials
Sensitive JWT
```

داخل:

```text
localStorage
sessionStorage
Zustand Persist
IndexedDB
```

"Remember Me" تعني التحكم في Persistence/Lifetime الخاصة بالجلسة الآمنة من خلال Backend.

يصبح Login Request مثل:

```json
{
  "identifier": "admin@example.com",
  "password": "Admin123!",
  "rememberMe": true
}
```

ويتم التحقق منه باستخدام Zod في Frontend وBackend.

---

# 73. Remember Me Session Strategy

يدعم Backend نوعين من Session behavior.

## Without Remember Me

عندما:

```text
rememberMe = false
```

استخدم Session قصيرة/Browser-session oriented.

يفضل أن يكون Refresh Cookie:

```text
HttpOnly
SameSite
Secure in production
```

وبدون Persistent `Max-Age`/`Expires` عندما يتوافق ذلك مع استراتيجية الـ session المختارة، بحيث تكون Browser Session Cookie.

يمكن أيضًا أن تكون مدة الـ server-side refresh session أقصر.

---

## With Remember Me

عندما:

```text
rememberMe = true
```

أنشئ Persistent Refresh Session أطول.

مثال configurable:

```text
normal refresh/session:
browser session or short lifetime

remembered session:
30 days
```

لا Hardcode مدة 30 يومًا داخل Business Logic.

استخدم Environment Configuration مثل:

```text
JWT_ACCESS_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN
JWT_REMEMBER_ME_EXPIRES_IN
```

أو أسماء أكثر ملاءمة وفق تصميم Session/Token النهائي.

يجب أن يكون Backend هو من يقرر:

```text
Cookie expiration
Refresh expiration
Session expiration
```

وليس Frontend.

---

# 74. Remember Me Types

حدّث Authentication Types.

مثال:

```ts
type LoginInput = {
  identifier: string;
  password: string;
  rememberMe: boolean;
};
```

وحدّث:

```text
auth.schema.ts
auth.service.ts
auth.routes.ts
Frontend login schema
Frontend auth types
```

حسب الحاجة.

لا تكرر Types بين الطبقات إذا كان ذلك يؤدي إلى Coupling غير مرغوب، لكن حافظ على Contract متناسق.

---

# 75. Remembered Session Restoration

عند إعادة فتح التطبيق:

```text
SplashScreen
     │
     ▼
Health Check
     │
     ▼
Auth Bootstrap
     │
     ▼
Browser automatically sends HttpOnly Refresh Cookie
     │
     ▼
Refresh / Session Restore
     │
     ├── Valid ──> HomeScreen
     │
     └── Invalid/Expired ──> LoginScreen
```

Frontend لا يحتاج قراءة Refresh Token.

يجب أن يعمل:

```ts
withCredentials: true
```

في Axios حسب CORS/Cookie configuration المناسبة.

---

# 76. Remember Identifier Preference

يمكن، كتحسين UX اختياري، تذكر:

```text
username/email/phone identifier
```

إذا كان المستخدم قد فعّل Remember Me.

لكن تعامل معه كـ Preference فقط وليس Credential.

يمكن تخزين Identifier في Zustand Persist أو localStorage إذا تقرر ذلك بوضوح.

ممنوع تخزين:

```text
password
```

حتى عند تفعيل Remember Me.

إذا تم تطبيق هذه الخاصية، اجعلها منفصلة مفهوميًا عن Session persistence:

```text
Remember Session
        ≠
Remember Password
        ≠
Remember Identifier
```

---

# 77. Logout Semantics

Logout يجب أن يلغي Session الحالية سواء كانت:

```text
Remembered
```

أو:

```text
Non-remembered
```

عند:

```http
POST /api/auth/logout
```

يجب:

```text
Invalidate/revoke refresh session where supported
Clear refresh cookie
Clear in-memory access authentication
Clear relevant React Query cache
Clear sensitive authentication state
Redirect to LoginScreen
```

لا تمسح تفضيلات المستخدم غير الحساسة مثل:

```text
Theme
Language
```

إلا إذا كان هناك قرار واضح بذلك.

---

# 78. Updated Startup Routing

يصبح Application Entry Flow النهائي:

```text
Application Start
        │
        ▼
┌──────────────────────┐
│     SplashScreen     │
└──────────┬───────────┘
           │
           ▼
Initialize Universal Systems
           │
           ├── Theme
           ├── i18n
           ├── Direction
           ├── Sentry
           └── App Providers
           │
           ▼
Check Backend Liveness
           │
     ┌─────┴─────┐
     │           │
   Failed       Success
     │           │
     ▼           ▼
Recovery UI   Readiness
+ Retry          │
            ┌────┴────┐
            │         │
          Failed    Success
            │         │
            ▼         ▼
        Recovery    Restore
          UI        Session
                       │
                ┌──────┴──────┐
                │             │
          Authenticated   Unauthenticated
                │             │
                ▼             ▼
          HomeScreen      LoginScreen
```

---

# 79. Updated Login Flow

يصبح:

```text
LoginScreen
    │
    ├── identifier
    ├── password
    └── rememberMe
           │
           ▼
React Hook Form + Zod
           │
           ▼
TanStack Query Mutation
           │
           ▼
Axios
           │
           ▼
POST /api/auth/login
           │
           ▼
Auth Service
           │
     ┌─────┴─────┐
     │           │
 Invalid       Valid
     │           │
     ▼           ▼
Safe Error    Create Session
                 │
                 ├── Standard Session
                 │
                 └── Remembered Session
                         │
                         ▼
                 Secure HttpOnly Cookie
                         │
                         ▼
                      /auth/me
                         │
                         ▼
                    HomeScreen
```

---

# 80. Splash + Bootstrap Separation of Concerns

لا تضع كل Startup Logic داخل:

```text
SplashScreen.tsx
```

`SplashScreen` يجب أن يكون Presentation Layer قدر الإمكان.

افصل:

```text
Bootstrap orchestration
Health API
Auth restoration
Bootstrap state
Bootstrap UI
Routing decision
```

مثال إرشادي:

```text
Frontend/src/
├── app/
│   ├── bootstrap/
│   │   ├── bootstrap.types.ts
│   │   ├── bootstrap.service.ts
│   │   └── use-app-bootstrap.ts
│   │
│   └── providers/
│
├── features/
│   ├── auth/
│   └── system-health/
│
└── pages/
    └── SplashScreen.tsx
```

يمكن تعديل الأسماء حسب Architecture الفعلية مع الحفاظ على فصل المسؤوليات.

---

# 81. Updated Verification

بالإضافة إلى الاختبارات السابقة، اختبر فعليًا:

```text
1. Application starts on SplashScreen.
2. SplashScreen لا تعتمد على artificial timeout.
3. Backend available → bootstrap continues.
4. Backend unavailable → Recovery UI appears.
5. Retry works after Backend becomes available.
6. Data Source readiness failure handled correctly.
7. Valid remembered session → HomeScreen مباشرة بعد bootstrap.
8. No session → LoginScreen.
9. Invalid/expired session → LoginScreen.
10. rememberMe=false → standard/browser-oriented session behavior.
11. rememberMe=true → persistent session survives browser restart وفق السياسة المحددة.
12. Refresh Token غير موجود في localStorage.
13. Password غير محفوظ في أي Client Storage.
14. Logout invalidates remembered session.
15. Reload لا يسبب LoginScreen flicker.
16. Splash works in English/LTR.
17. Splash works in Arabic/RTL.
18. Splash works in Light/Dark themes.
19. Health request لا يدخل في refresh-token infinite loop.
20. Docker health status reflects backend health correctly.
```

---

# 82. Updated Target Screens

النسخة الأولى تحتوي الآن على:

```text
SplashScreen.tsx
LoginScreen.tsx
HomeScreen.tsx
```

ويكون التسلسل:

```text
SplashScreen
     │
     ├── System unavailable ──> Recovery / Retry
     │
     └── System ready
              │
              ▼
        Authentication
           Bootstrap
          ┌────┴────┐
          │         │
      Logged in   Logged out
          │         │
          ▼         ▼
        Home       Login
```

---

# 83. قاعدة أمنية لـ Remember Me

قاعدة إلزامية:

```text
"Remember Me" must remember the session,
not the password.
```

أي Implementation يقوم بحفظ:

```text
password
refresh token
sensitive JWT
```

في Browser Storage يعتبر Implementation غير مقبول.

يجب تحقيق تذكر المستخدم باستخدام:

```text
Server-controlled session lifetime
+
Secure HttpOnly Cookie
+
Authentication Bootstrap
```

مع بقاء:

```text
Theme
Language
Non-sensitive preferences
```

داخل Client persistence عند الحاجة.

---

# 84. Updated Milestone Acceptance Criteria

لا تعتبر Milestone الأولى مكتملة إلا عندما يعمل التدفق التالي End-to-End:

```text
Docker Up
   │
   ▼
Backend Health
   │
   ▼
SplashScreen
   │
   ▼
System Readiness
   │
   ▼
Session Restoration
   │
   ├── Existing Remembered Session
   │          │
   │          ▼
   │      HomeScreen
   │
   └── No Session
          │
          ▼
      LoginScreen
          │
          ├── Normal Login
          │
          └── Remember Me Login
                    │
                    ▼
                HomeScreen
                    │
                    ▼
                  Logout
```

ويعمل ذلك مع:

```text
React 19
Vite 6
TanStack Router
TanStack Query
Axios
Zustand
React Hook Form
Zod
i18next
Universal Design System
Universal Theme System
Universal Alias System
Universal Utils System
Docker
Backend
MinIO
```

مع عدم التضحية بالأمان أو حدود الـ Business Modules.