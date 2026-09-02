/**
 * @file        : Backend/src/modules/health/health.controller.ts
 * @description : Controllers نقاط الـ health — بتترجم نتيجة الـ service لاستجابة HTTP فقط.
 * @updated     : [{ "date": "02/09/2026", "version": "1.1.0", "by": ["v0"], "comment": "نقل المنطق إلى health.service وإضافة live/ready" }]
 */

import type { Request, Response } from "express"
import { sendSuccess } from "@shared/response.js"
import { getLiveness, getReadiness } from "./health.service.js"

/** `GET /api/health/live` — 200 دائماً طالما العملية بتستجيب. */
export function getLive(_req: Request, res: Response) {
  return sendSuccess(res, getLiveness())
}

/**
 * `GET /api/health/ready` — 503 لو طبقة البيانات مش جاهزة، عشان الـ
 * healthcheck في Docker/الـ load balancer يقدر يعتمد على status code فقط.
 */
export async function getReady(_req: Request, res: Response) {
  const report = await getReadiness()
  return sendSuccess(res, report, report.status === "ok" ? 200 : 503)
}

/**
 * `GET /api/health` — التقرير الكامل اللي الـ Frontend بيقرأه في الـ bootstrap.
 * بيرجّع 200 حتى في حالة degraded لأن الـ Frontend محتاج يقرأ التفاصيل
 * ويقرر بنفسه (شاشة recovery بدل مجرد فشل شبكة).
 */
export async function getHealth(_req: Request, res: Response) {
  return sendSuccess(res, await getReadiness())
}
