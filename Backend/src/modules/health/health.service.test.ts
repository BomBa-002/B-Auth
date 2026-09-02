/**
 * @file        : Backend/src/modules/health/health.service.test.ts
 * @description : اختبارات خدمة الصحة — liveness وreadiness وتأثير طبقة البيانات على الحالة.
 * @updated     : [{ "date": "02/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "إضافة اختبارات live/ready" }]
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

const findAll = vi.fn()
const checkStorageHealth = vi.fn()

vi.mock("@shared/repositories.js", () => ({
  usersRepository: { findAll: (...args: unknown[]) => findAll(...args) },
}))
vi.mock("@modules/storage/storage.service.js", () => ({
  checkStorageHealth: (...args: unknown[]) => checkStorageHealth(...args),
}))

import { getLiveness, getReadiness } from "./health.service.js"

describe("health service", () => {
  beforeEach(() => {
    findAll.mockReset().mockResolvedValue([])
    checkStorageHealth.mockReset().mockResolvedValue({ configured: false, reachable: false })
  })

  it("liveness يرجع ok دائماً بدون لمس أي اعتمادية", () => {
    expect(getLiveness()).toMatchObject({ status: "ok" })
    expect(findAll).not.toHaveBeenCalled()
    expect(checkStorageHealth).not.toHaveBeenCalled()
  })

  it("readiness يرجع ok لما طبقة البيانات متاحة", async () => {
    const report = await getReadiness()
    expect(report.status).toBe("ok")
    expect(report.checks.dataLayer.healthy).toBe(true)
  })

  it("readiness يرجع degraded لما طبقة البيانات تفشل", async () => {
    findAll.mockRejectedValue(new Error("disk gone"))
    const report = await getReadiness()
    expect(report.status).toBe("degraded")
    expect(report.checks.dataLayer.healthy).toBe(false)
  })

  it("غياب الـ storage ما بيغيّرش الحالة العامة (اختياري في التطوير)", async () => {
    checkStorageHealth.mockResolvedValue({ configured: false, reachable: false })
    const report = await getReadiness()
    expect(report.status).toBe("ok")
    expect(report.checks.storage.configured).toBe(false)
  })
})
