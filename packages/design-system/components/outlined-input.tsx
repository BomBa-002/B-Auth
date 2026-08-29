import * as React from "react"

/**
 * Outlined Input Fields — Material-inspired floating label component.
 *
 * Styling lives entirely in `../styles/outlined-input.css` (imported once by
 * `globals.css`), driven by the `--oi-*` CSS variables so any consumer can
 * retheme the field without touching this file. RTL/LTR mirroring is
 * automatic because the CSS uses logical properties exclusively.
 *
 * A single leading space is used as the default `placeholder` when the
 * caller doesn't provide one — this is what makes the `:placeholder-shown`
 * CSS selector a reliable "is this field empty?" check across browsers,
 * which in turn drives the label float animation without any JS state.
 */
export interface OutlinedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** Floating label text — always required for an outlined field. */
  label: string
  /** Explicit id; auto-generated via `useId` when omitted. */
  id?: string
  /** Validation error message. Presence also flips the field into its error visual state. */
  error?: string
  /** Helper text shown when there is no error. */
  helperText?: string
  /** Icon rendered at the end (inline-end) of the field, e.g. show/hide password. */
  endIcon?: React.ReactNode
  /** Click handler for the end icon. Icon is non-interactive (aria-hidden) when omitted. */
  onEndIconClick?: () => void
  /** Accessible label for the end icon button, required when `onEndIconClick` is set. */
  endIconLabel?: string
  /** Extra class name applied to the outer wrapper (`.oi-root`). */
  containerClassName?: string
}

export const OutlinedInput = React.forwardRef<HTMLInputElement, OutlinedInputProps>(
  (
    {
      label,
      id,
      error,
      helperText,
      endIcon,
      onEndIconClick,
      endIconLabel,
      className,
      containerClassName,
      disabled,
      placeholder,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const hasDescription = Boolean(error || helperText)
    const descriptionId = hasDescription ? `${inputId}-description` : undefined

    return (
      <div
        className={containerClassName ? `oi-root ${containerClassName}` : "oi-root"}
        data-error={error ? "true" : "false"}
        data-disabled={disabled ? "true" : "false"}
      >
        <div className="oi-control">
          <input
            ref={ref}
            id={inputId}
            className={className ? `oi-input ${className}` : "oi-input"}
            placeholder={placeholder ?? " "}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={descriptionId}
            {...props}
          />
          <label htmlFor={inputId} className="oi-label">
            {label}
          </label>
          {endIcon ? (
            <button
              type="button"
              className="oi-end-icon"
              onClick={onEndIconClick}
              disabled={disabled}
              aria-label={endIconLabel}
              aria-hidden={onEndIconClick ? undefined : true}
              tabIndex={onEndIconClick ? 0 : -1}
            >
              {endIcon}
            </button>
          ) : null}
        </div>
        {hasDescription ? (
          <p id={descriptionId} className="oi-helper">
            {error ?? helperText}
          </p>
        ) : null}
      </div>
    )
  }
)
OutlinedInput.displayName = "OutlinedInput"
