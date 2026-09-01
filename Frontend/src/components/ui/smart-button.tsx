/**
 * @file        : Frontend/src/components/ui/smart-button.tsx
 * @description : زر ذكي بتحميل وأقفال تنفيذ من غير ربط بطبقات البزنس.
 * @updated     : [{ "date": "01/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "إنشاء SmartButton" }]
 */

import { React, Button, IconSpinner, type ButtonProps } from '@a'
import { ActionLockManager, type ActionLockKey } from '@features/ui/action-lock-manager'

export interface SmartButtonContext {
  signal: AbortSignal
  executionId: string
}

export interface SmartButtonProps extends ButtonProps {
  action?: (context: SmartButtonContext) => void | Promise<unknown>
  lockKey?: ActionLockKey
  lockGroup?: ActionLockKey
  loading?: boolean
  onSuccess?: (result: unknown) => void
  onError?: (error: unknown) => void
  onSettled?: () => void
}

export const SmartButton = React.forwardRef<HTMLButtonElement, SmartButtonProps>(
  ({ action, lockKey, lockGroup, loading = false, disabled, onClick, onSuccess, onError, onSettled, children, ...props }, ref) => {
    const [isRunning, setIsRunning] = React.useState(false)
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (event) => {
      onClick?.(event)
      if (!action || event.defaultPrevented || isRunning || loading || disabled) return
      event.preventDefault()
      const owner = ActionLockManager.tryAcquire({ lockKey, lockGroup })
      if (!owner) {
        return
      }
      const controller = new AbortController()
      const executionId = crypto.randomUUID()
      setIsRunning(true)
      try {
        const result = await action({ signal: controller.signal, executionId })
        onSuccess?.(result)
      } catch (error) {
        onError?.(error)
      } finally {
        ActionLockManager.release(owner)
        setIsRunning(false)
        onSettled?.()
      }
    }

    return (
      <Button ref={ref} {...props} disabled={disabled || loading || isRunning} aria-busy={loading || isRunning} onClick={handleClick}>
        {(loading || isRunning) && <IconSpinner aria-hidden="true" className="animate-spin" />}
        {children}
      </Button>
    )
  },
)
SmartButton.displayName = 'SmartButton'
