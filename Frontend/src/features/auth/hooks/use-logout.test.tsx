/**
 * @file        : Frontend/src/features/auth/hooks/use-logout.test.tsx
 * @description : اختبارات تسجيل الخروج الحقيقي — إبطال الجلسة على السيرفر ثم مسح الحالة المحلية حتى لو السيرفر فشل.
 * @updated     : [{ "date": "02/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "إضافة اختبارات useLogout" }]
 */

import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@a'
import { useLogout } from './use-logout'

const logoutRequest = vi.fn<() => Promise<void>>()
vi.mock('@services/auth.service', () => ({ logout: () => logoutRequest() }))

const fakeUser = { id: 'u1', username: 'admin', email: 'a@b.c', displayName: 'Admin', roles: ['admin'], permissions: ['*'] }

describe('useLogout', () => {
  beforeEach(() => {
    logoutRequest.mockReset()
    useAuthStore.getState().setSession({ accessToken: 'tok', user: fakeUser, persistent: true })
  })

  it('calls the server logout endpoint before clearing the local session', async () => {
    logoutRequest.mockResolvedValue(undefined)
    const onDone = vi.fn()
    const { result } = renderHook(() => useLogout(onDone))

    await act(async () => { await result.current.logout() })

    expect(logoutRequest).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('still clears the local session when the server request fails', async () => {
    logoutRequest.mockRejectedValue(new Error('network'))
    const onDone = vi.fn()
    const { result } = renderHook(() => useLogout(onDone))

    await act(async () => { await result.current.logout() })

    expect(useAuthStore.getState().user).toBeNull()
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
