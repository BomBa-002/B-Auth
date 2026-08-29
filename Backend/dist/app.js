import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { env, isDevelopment } from "@config/env.js";
import { apiRateLimiter } from "@middleware/rate-limit.js";
import { errorHandler, notFoundHandler } from "@middleware/error-handler.js";
import { authRouter } from "@modules/auth/auth.routes.js";
import { userRouter } from "@modules/users/user.routes.js";
import { roleRouter } from "@modules/roles/role.routes.js";
import { storageRouter } from "@modules/storage/storage.routes.js";
import { healthRouter } from "@modules/health/health.routes.js";
export function createApp() {
    const app = express();
    // Trust exactly one hop (the dev proxy / load balancer in front of us) so
    // express-rate-limit can read X-Forwarded-For safely without becoming
    // spoofable by client-supplied headers.
    app.set("trust proxy", 1);
    app.disable("x-powered-by");
    app.use(helmet({
        contentSecurityPolicy: false, // CSP is set by the Frontend host, not this API
        crossOriginResourcePolicy: { policy: "cross-origin" },
    }));
    app.use(cors({
        origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
        credentials: true,
    }));
    app.use(compression());
    app.use(express.json({ limit: "1mb" }));
    app.use(cookieParser());
    if (isDevelopment)
        app.use(morgan("dev"));
    app.use(apiRateLimiter);
    app.use("/api/health", healthRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/users", userRouter);
    app.use("/api/roles", roleRouter);
    app.use("/api/storage", storageRouter);
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map