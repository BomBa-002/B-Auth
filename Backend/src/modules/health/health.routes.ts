import { Router } from "express"
import { asyncHandler } from "@middleware/error-handler.js"
import { getHealth } from "./health.controller.js"

export const healthRouter = Router()

healthRouter.get("/", asyncHandler(getHealth))
