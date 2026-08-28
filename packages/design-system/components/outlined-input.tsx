/**
 * @file        : packages/design-system/components/outlined-input.tsx
 * @description : حقل إدخال ذكي بملصق عائم واقتراحات وتحكم كامل بلوحة المفاتيح.
 * @updated     : [{ "date": "29/08/2026", "version": "2.0.0", "by": ["v0"], "comment": "تحويل الحقل إلى SmartInput" }]
 */

import * as React from "react"

export interface SmartInputSuggestion {
  value: string
  label?: string
}

export interface OutlinedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "onChange"> {
  label: string
  id?: string
  error?: string
  helperText?: string
  endIcon?: React.ReactNode
  onEndIconClick?: () => void
  endIconLabel?: string
  containerClassName?: string
  prefixIcon?: React.ReactNode
  suggestions?: SmartInputSuggestion[]
  group?: string
  minChars?: number
  showOnFocus?: boolean
  onSearch?: (value: string) => void
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  validationState?: "default" | "success" | "error"
}

/**
 * SmartInput - حقل إدخال بملصق عائم وتحكم داخلي واقتراحات اختيارية.
 * @remarks بيستخدم placeholder مخفي عشان الـ label يطفو بدون state إضافي، وبيحافظ على توافق API المكوّن القديم.
 */
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
      containerClassName,
      prefixIcon,
      suggestions = [],
      group,
      minChars = 1,
      showOnFocus = false,
      onSearch,
      onChange,
      validationState = error ? "error" : "default",
      className,
      disabled,
      placeholder,
      type = "text",
      value,
      defaultValue,
      autoComplete,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const listId = `${inputId}-suggestions`
    const descriptionId = error || helperText ? `${inputId}-description` : undefined
    const [internalValue, setInternalValue] = React.useState(String(defaultValue ?? ""))
    const [isFocused, setIsFocused] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(-1)
    const [passwordVisible, setPasswordVisible] = React.useState(false)
    const inputValue = value === undefined ? internalValue : String(value)
    const normalizedValue = inputValue.trim().toLowerCase()
    const filteredSuggestions = suggestions.filter((suggestion) => {
      if (inputValue.trim().length < minChars) return false
      return suggestion.value.toLowerCase().includes(normalizedValue)
    })
    const isListVisible = !disabled && isFocused && (showOnFocus || inputValue.trim().length >= minChars) && suggestions.length > 0
    const hasClear = inputValue.length > 0 && !disabled
    const isPassword = type === "password"
    const hasEndAction = Boolean(endIcon && onEndIconClick)
    const describedBy = [descriptionId, isListVisible ? listId : undefined].filter(Boolean).join(" ") || undefined

    const updateValue = (nextValue: string, event?: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(nextValue)
      if (event) onChange?.(event)
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      updateValue(event.target.value, event)
      setActiveIndex(-1)
    }

    const handleSuggestionSelect = (suggestion: SmartInputSuggestion) => {
      const nextValue = suggestion.value
      setInternalValue(nextValue)
      setActiveIndex(-1)
      const syntheticEvent = { target: { value: nextValue }, currentTarget: { value: nextValue } } as React.ChangeEvent<HTMLInputElement>
      onChange?.(syntheticEvent)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        setActiveIndex(-1)
        return
      }
      if (event.key === "ArrowDown" && filteredSuggestions.length > 0) {
        event.preventDefault()
        setActiveIndex((current) => (current + 1) % filteredSuggestions.length)
        return
      }
      if (event.key === "ArrowUp" && filteredSuggestions.length > 0) {
        event.preventDefault()
        setActiveIndex((current) => (current <= 0 ? filteredSuggestions.length - 1 : current - 1))
        return
      }
      if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault()
        const activeSuggestion = filteredSuggestions[activeIndex]
        if (activeSuggestion) handleSuggestionSelect(activeSuggestion)
        return
      }
      if (event.key === "Backspace" && event.ctrlKey) {
        event.currentTarget.setSelectionRange(0, event.currentTarget.selectionStart ?? 0)
      }
      if (event.key === "Enter" && event.ctrlKey) onSearch?.(inputValue)
    }

    const handleClear = () => {
      setInternalValue("")
      const syntheticEvent = { target: { value: "" }, currentTarget: { value: "" } } as React.ChangeEvent<HTMLInputElement>
      onChange?.(syntheticEvent)
    }

    return (
      <div className={containerClassName ? `oi-root ${containerClassName}` : "oi-root"} data-group={group} data-error={validationState === "error" ? "true" : "false"} data-validation={validationState} data-disabled={disabled ? "true" : "false"}>
        <div className="oi-control">
          {prefixIcon ? <span className="oi-prefix-icon" aria-hidden="true">{prefixIcon}</span> : null}
          <input
            {...props}
            ref={ref}
            id={inputId}
            className={className ? `oi-input ${className}` : "oi-input"}
            placeholder={placeholder ?? " "}
            disabled={disabled}
            type={isPassword && passwordVisible ? "text" : type}
            value={value ?? internalValue}
            defaultValue={undefined}
            autoComplete={autoComplete ?? "new-password"}
            aria-invalid={validationState === "error" ? true : undefined}
            aria-describedby={describedBy}
            aria-autocomplete={suggestions.length > 0 ? "list" : undefined}
            aria-controls={isListVisible ? listId : undefined}
            aria-expanded={suggestions.length > 0 ? isListVisible : undefined}
            aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
            onChange={handleChange}
            onFocus={(event) => { setIsFocused(true); props.onFocus?.(event) }}
            onBlur={(event) => { window.setTimeout(() => setIsFocused(false), 120); props.onBlur?.(event) }}
            onKeyDown={(event) => { handleKeyDown(event); props.onKeyDown?.(event) }}
          />
          <label htmlFor={inputId} className="oi-label">{label}</label>
          <span className="oi-actions">
            {hasClear ? <button type="button" className="oi-action" onClick={handleClear} tabIndex={-1} aria-label={`Clear ${label}`}>×</button> : null}
            {isPassword ? <button type="button" className="oi-action" onClick={() => setPasswordVisible((current) => !current)} disabled={disabled} aria-label={passwordVisible ? `Hide ${label}` : `Show ${label}`} tabIndex={-1}>{passwordVisible ? "◉" : "○"}</button> : null}
            {hasEndAction ? <button type="button" className="oi-action" onClick={onEndIconClick} disabled={disabled} aria-label={endIconLabel ?? label} tabIndex={-1}>{endIcon}</button> : endIcon ? <span className="oi-action" aria-hidden="true">{endIcon}</span> : null}
            {onSearch ? <button type="button" className="oi-action" onClick={() => onSearch(inputValue)} disabled={disabled} tabIndex={-1} aria-label={`Search ${label}`}>⌕</button> : null}
            {validationState === "success" ? <span className="oi-validation-icon" aria-label="Valid" role="img">✓</span> : null}
          </span>
        </div>
        {isListVisible ? <ul id={listId} className="oi-suggestions" role="listbox" aria-label={`${label} suggestions`}>
          {filteredSuggestions.length > 0 ? filteredSuggestions.map((suggestion, index) => <li key={`${suggestion.value}-${index}`} id={`${listId}-${index}`} className="oi-suggestion" role="option" aria-selected={index === activeIndex} onMouseDown={(event) => event.preventDefault()} onClick={() => handleSuggestionSelect(suggestion)}>{suggestion.label ?? suggestion.value}</li>) : <li className="oi-no-results" role="status">No results</li>}
        </ul> : null}
        {error || helperText ? <p id={descriptionId} className="oi-helper">{error ?? helperText}</p> : null}
      </div>
    )
  },
)
OutlinedInput.displayName = "SmartInput"
export type { OutlinedInputProps as SmartInputProps }
export const SmartInput = OutlinedInput

