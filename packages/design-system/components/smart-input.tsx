import * as React from "react"

/**
 * @file        : packages/design-system/components/smart-input.tsx
 * @description : مكوّن إدخال ذكي بوسم عائم وحالات تحقق وتحميل.
 * @updated     : [{ "date": "29/08/2026", "version": "1.0.0", "by": ["v0"], "comment": "إنشاء المكوّن" }]
 */

export interface SmartInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** النص اللي بيظهر كـ floating label. */
  label: string
  /** معرّف اختياري؛ بيتولد تلقائياً لو مش موجود. */
  id?: string
  /** رسالة الخطأ، ووجودها يفعّل حالة الخطأ. */
  error?: string
  /** نص مساعد بيظهر لو مفيش خطأ. */
  helperText?: string
  /** أيقونة في نهاية الحقل. */
  endIcon?: React.ReactNode
  /** callback للأيقونة الطرفية لما تكون تفاعلية. */
  onEndIconClick?: () => void
  /** اسم وصول مطلوب للأيقونة التفاعلية. */
  endIconLabel?: string
  /** كلاسات إضافية للحاوية الخارجية. */
  containerClassName?: string
  /** حالة نجاح اختيارية. */
  success?: boolean
  /** حالة التحميل الاختيارية. */
  loading?: boolean
}

/**
 * @description حقل إدخال بوسم عائم وحالات وصول واضحة، من غير ما يغير سلوك input القياسي.
 */
export const SmartInput = React.forwardRef<HTMLInputElement, SmartInputProps>(
  (
    {
      label,
      id,
      error,
      helperText,
      endIcon,
      onEndIconClick,
      endIconLabel,
      containerClassName,
      success,
      loading,
      disabled,
      placeholder,
      className,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const descriptionId = error || helperText ? `${inputId}-description` : undefined
    const isDisabled = disabled || loading

    return (
      <div
        className={containerClassName ? `si-root ${containerClassName}` : "si-root"}
        data-error={error ? "true" : "false"}
        data-success={success && !error ? "true" : "false"}
        data-disabled={isDisabled ? "true" : "false"}
        data-loading={loading ? "true" : "false"}
      >
        <div className="si-control">
          <input
            {...props}
            ref={ref}
            id={inputId}
            className={className ? `si-input ${className}` : "si-input"}
            placeholder={placeholder ?? " "}
            disabled={isDisabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={descriptionId}
            aria-busy={loading ? true : undefined}
          />
          <label htmlFor={inputId} className="si-label">
            {label}
          </label>
          {loading ? <span className="si-loader" aria-hidden="true" /> : null}
          {endIcon && !loading ? (
            <button
              type="button"
              className="si-end-icon"
              onClick={onEndIconClick}
              disabled={isDisabled}
              aria-label={onEndIconClick ? endIconLabel : undefined}
              aria-hidden={onEndIconClick ? undefined : true}
              tabIndex={onEndIconClick ? 0 : -1}
            >
              {endIcon}
            </button>
          ) : null}
        </div>
        {descriptionId ? (
          <p id={descriptionId} className="si-helper">
            {error ?? helperText}
          </p>
        ) : null}
      </div>
    )
  }
)
SmartInput.displayName = "SmartInput"

export type { SmartInputProps as T_SmartInputProps }
