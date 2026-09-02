/**
 * @file        : Frontend/src/components/ui/smart-button.test.tsx
 * @description : اختبارات دورة تنفيذ SmartButton وحالات القفل والفشل.
 * @updated     : [{ "date": "02/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "إضافة اختبارات الزر الذكي" }]
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SmartButton } from './smart-button'

function deferred<T>() {
  let resolvePromise: (value: T) => void = () => undefined
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve
  })
  return { promise, resolvePromise }
}

describe('SmartButton', () => {
  it('runs an async action once and settles after completion', async () => {
    const pending = deferred<string>()
    const action = vi.fn(() => pending.promise)
    const onSuccess = vi.fn()
    const onSettled = vi.fn()

    render(<SmartButton action={action} onSuccess={onSuccess} onSettled={onSettled}>حفظ</SmartButton>)
    const button = screen.getByRole('button', { name: 'حفظ' })

    fireEvent.click(button)
    fireEvent.click(button)

    expect(action).toHaveBeenCalledTimes(1)
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()

    pending.resolvePromise('done')
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('done'))
    expect(onSettled).toHaveBeenCalledTimes(1)
    expect(button).not.toHaveAttribute('aria-busy', 'true')
  })

  it('reports rejected actions and releases the lock for a later run', async () => {
    const action = vi.fn()
      .mockRejectedValueOnce(new Error('failed'))
      .mockResolvedValueOnce('recovered')
    const onError = vi.fn()

    render(<SmartButton action={action} lockKey="test:retry" onError={onError}>إعادة المحاولة</SmartButton>)
    const button = screen.getByRole('button', { name: 'إعادة المحاولة' })

    fireEvent.click(button)
    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1))
    fireEvent.click(button)

    await waitFor(() => expect(action).toHaveBeenCalledTimes(2))
  })
})
