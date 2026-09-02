# @file        : Frontend/Dockerfile
# @description : صورة الـ Frontend — بناء Vite ثم تقديم الملفات عبر nginx مع proxy للـ /api.
# ملاحظة: الـ build context لازم يكون جذر المستودع (شوف docker-compose.yml).

# ---------- مرحلة البناء ----------
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY Frontend/package.json ./Frontend/
RUN pnpm install --frozen-lockfile --filter @b-auth/frontend...
COPY Frontend ./Frontend
RUN pnpm --filter @b-auth/frontend build

# ---------- مرحلة التقديم ----------
FROM nginx:1.27-alpine
# القالب بيتحول لـ conf عند الإقلاع عبر envsubst المدمج — BACKEND_HOST بيتحدد من البيئة
# (محلياً docker-compose بيمرر "backend"، وعلى Railway "backend.railway.internal").
COPY Frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
ENV BACKEND_HOST=backend
COPY --from=build /app/Frontend/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
