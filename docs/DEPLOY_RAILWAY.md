# دليل النشر على Railway.com — B-Auth

**آخر تحديث:** 2026-09-03

النشر بالاعتماد على Docker: كل خدمة من خدمات الـ docker-compose بتتحول لـ **Service منفصلة** على Railway (Railway مش بيشغّل docker-compose.yml مباشرة).

---

## 1) المعمارية على Railway

| الخدمة | المصدر | ملاحظات |
|---|---|---|
| **backend** | Dockerfile: `Backend/Dockerfile` — Root Directory: جذر المستودع | Node API + JSON storage على Volume |
| **frontend** | Dockerfile: `Frontend/Dockerfile` — Root Directory: جذر المستودع | nginx بيقدم الـ SPA ويعمل proxy للـ `/api` |
| **minio** | Template جاهز على Railway (MinIO) | تخزين الكائنات S3-compatible |
| **minio-init** | خدمة لمرة واحدة (صورة `minio/mc`) | إنشاء الـ bucket — بتتشال بعد التنفيذ |

التدفق: المتصفح → frontend (nginx) → `/api` proxy → backend → MinIO.
الـ cookies بتاعة الـ refresh من نوع HttpOnly وبتشتغل من نفس الأصل لأن nginx بيعمل proxy — مفيش CORS خالص.

---

## 2) إنشاء المشروع والخدمات (بالترتيب)

### أ. المشروع
1. حساب على [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → اختار `BomBa-002/B-Auth` والفرع المطلوب.

### ب. خدمة minio (الأول دايماً)
1. جوه المشروع: **+ New** → **Marketplace** → اختار **MinIO**.
2. من تبويب **Variables** سجّل:
   - `MINIO_ROOT_USER` (اختار قيمة قوية)
   - `MINIO_ROOT_PASSWORD` (اختار قيمة قوية)
3. من تبويب **Settings** → **Networking** → **Generate Domain** للمنفذ `9000` (ده الـ S3 API) — احفظ الدومين ده.
4. (اختياري) ولّد دومين تاني للمنفذ `9001` لو عايز الـ Console.

### ج. خدمة minio-init (لمرة واحدة)
1. **+ New** → **Empty Service** → من **Settings**:
   - **Source Image:** `minio/mc:latest`
   - **Command:**
     ```
     sh -c "mc alias set local http://<MINIO_PRIVATE_DOMAIN>:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD && mc mb --ignore-existing local/b-auth-storage"
     ```
     (استخدم الدومين الداخلي/الخاصة للـ MinIO لو متاح، وإلا الدومين العام.)
   - **Restart Policy:** `Never`
2. متغيرات الخدمة: `MINIO_ROOT_USER` و `MINIO_ROOT_PASSWORD` (نفس قيم الخدمة) — سكريبت envsubst مش شغال هنا، القيم بتتقرأ من الـ shell في الـ command.
3. شغّلها مرة واحدة، اتأكد من الـ Logs إن الـ bucket اتعمل، وبعدين **Delete** الخدمة دي.

### د. خدمة backend
1. **+ New** → **GitHub Repo** → نفس الريبو (هيضيف service تاني من نفس المصدر).
2. من **Settings → Build**:
   - **Root Directory:** `/` (جذر المستودع)
   - **Custom Dockerfile Path:** `Backend/Dockerfile`
3. من **Settings → Deploy**:
   - **Custom Start Command:** سيبه فاضي (الـ Dockerfile CMD شغال: seed ثم server)
   - **Healthcheck Path:** `/api/health/ready`
   - **Restart Policy:** `ON_FAILURE`
4. من **Settings → Networking** → **Generate Domain** للمنفذ `4000` — ده الدومين العام (مش هيتستخدم مباشرة، بس مفيد للاختبار).
5. من **Settings → Networking** فعّل **Private Networking** — هيدي الخدمة اسم داخلي زي `backend.railway.internal`.
6. من **Settings → Volumes** → **Create Volume** → Mount Path: `/app/data` (بيانات الـ JSON لازم تعيش إعادة التشغيل).
7. من تبويب **Variables** (شوف الجدول في القسم 3).

### هـ. خدمة frontend
1. **+ New** → **GitHub Repo** → نفس الريبو.
2. من **Settings → Build**:
   - **Root Directory:** `/`
   - **Custom Dockerfile Path:** `Frontend/Dockerfile`
3. من **Settings → Networking** → **Generate Domain** للمنفذ `80` — **ده الدومين اللي بتفتحه من المتصفح**.
4. من تبويب **Variables**:
   - `BACKEND_HOST` = `backend.railway.internal` (اسم خدمة الـ backend الداخلي — اكتبه يدوياً أو استخدم Reference Variable من خدمة الـ backend).

---

## 3) متغيرات بيئة خدمة backend

| المتغير | القيمة | ملاحظات |
|---|---|---|
| `NODE_ENV` | `production` | |
| `PORT` | `4000` | |
| `CORS_ORIGIN` | `https://<frontend-domain>.up.railway.app` | الدومين العام للـ frontend |
| `JWT_ACCESS_SECRET` | قيمة عشوائية 32+ بايت | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | قيمة عشوائية مختلفة | نفس الطريقة |
| `JWT_ACCESS_TTL` | `15m` | |
| `JWT_REFRESH_TTL_SESSION` | `1d` | |
| `JWT_REFRESH_TTL_REMEMBER` | `30d` | |
| `COOKIE_SECURE` | `true` | الدومين العام HTTPS — إلزامي للـ cookies |
| `DATA_DIR` | `/app/data` | نفس مسار الـ Volume |
| `S3_ENDPOINT` | `http://<minio-private-domain>:9000` | الدومين الداخلي للـ MinIO |
| `S3_REGION` | `us-east-1` | |
| `S3_ACCESS_KEY_ID` | نفس `MINIO_ROOT_USER` | |
| `S3_SECRET_ACCESS_KEY` | نفس `MINIO_ROOT_PASSWORD` | |
| `S3_BUCKET` | `b-auth-storage` | نفس اللي اتعمل في minio-init |
| `S3_FORCE_PATH_STYLE` | `true` | إلزامي مع MinIO |

> **مهم:** `COOKIE_SECURE=true` معناه الموقع لازم يفتح على HTTPS (دومين Railway بيوفره تلقائياً).

---

## 4) التحقق بعد النشر (تدفق الـ Milestone)

1. **Health:** افتح `https://<backend-domain>/api/health/ready` → المفروض يرجع `{"success":true,...}` (الـ ready بيفحص الـ storage كمان).
2. **Docker Up:** كل الخدمات green في لوحة Railway.
3. **Splash:** افتح دومين الـ frontend → شاشة الـ Splash بتكمل لآخرها.
4. **Login:** سجّل دخول بـ `admin` / كلمة المرور بتاعة الـ seed (شوف `Backend/src/seed.ts` — أو غيّرها أول حاجة).
5. **Logout:** اعمل خروج → الـ cookie تتمسح والـ session تتلغى.

> **أمان قبل الإنتاج:** غيّر بيانات admin الافتراضية فوراً بعد أول دخول، وتأكد إن `JWT_*_SECRET` قيم إنتاج مش قيم الـ dev.

---

## 5) ملاحظات مهمة

- **Root Directory لازم يفضل جذر المستودع** — ملفات الـ Dockerfile بتاعتها بتعمل `COPY packages ./packages` من الجذر. لو غيرت الـ Root Directory للـ Build هيفشل.
- **الـ Volumes مش اختيارية:** من غير Volume على `/app/data` كل المستخدمين والجلسات بيمسحوا مع كل deploy.
- **التوسع أفقي (replicas > 1) مش مدعوم حالياً** — تخزين الـ JSON محلي لكل instance. لو محتاج أكثر من نسخة، لازم ننقل التخزين لقاعدة بيانات حقيقية أولاً.
- **docker-compose.yml فضل شغال محلياً زي ما هو** — التعديل الوحيد إن nginx بقى بيقرأ `BACKEND_HOST` من البيئة (افتراضي `backend` فمفيش تغيير مطلوب محلياً).
