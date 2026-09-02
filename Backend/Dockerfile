# @file        : Backend/Dockerfile
# @description : صورة الـ Backend — بناء متعدد المراحل (build ثم runtime نحيف).
# ملاحظة: الـ build context لازم يكون جذر المستودع (شوف docker-compose.yml).

# ---------- مرحلة الأساس ----------
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# ---------- مرحلة الاعتماديات ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY Backend/package.json ./Backend/
# --filter بيجيب اعتماديات الـ backend وworkspace packages بتاعته بس.
RUN pnpm install --frozen-lockfile --filter @b-auth/backend...

# ---------- مرحلة البناء ----------
FROM deps AS build
COPY Backend ./Backend
RUN pnpm --filter @b-auth/backend build

# ---------- مرحلة التشغيل ----------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# non-root user لأمان الحاوية
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/Backend/dist ./dist
COPY --from=build --chown=app:app /app/Backend/package.json ./package.json
# مجلد البيانات (JSON repositories) — بيتعمل بـ seed عند الإقلاع لو فاضي.
RUN mkdir -p /app/data && chown app:app /app/data
VOLUME ["/app/data"]
USER app
EXPOSE 4000
# seed أولاً (idempotent) ثم تشغيل السيرفر.
CMD ["sh", "-c", "node dist/seed.js && node dist/server.js"]
