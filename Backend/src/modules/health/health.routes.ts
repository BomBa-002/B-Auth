import { Router } from "express"
import { asyncHandler } from "@middleware/error-handler.js"
import { getHealth, getLive, getReady } from "./health.controller.js"

export const healthRouter = Router()

// التقرير الكامل للـ Frontend bootstrap.
healthRouter.get("/", asyncHandler(getHealth))
// Liveness للـ orchestrator: العملية شغالة فقط.
healthRouter.get("/live", getLive)
// Readiness للـ orchestrator/الـ load balancer: 503 لو الاعتماديات مش جاهزة.
healthRouter.get("/ready", asyncHandler(getReady))
