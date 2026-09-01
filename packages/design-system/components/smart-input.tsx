/**
 * @file        : packages/design-system/components/smart-input.tsx
 * @description : حقل إدخال ذكي بترجمة عائمة، تحقق، اقتراحات، وتفاعل كامل بلوحة المفاتيح.
 * @updated     : [{ "date": "01/09/2026", "version": "1.2.0", "by": ["v0"], "comment": "استكمال ARIA والاقتراحات والتحكم في حالات الإدخال" }]
 */

import * as React from 'react'
import {
  IconCheckCircle,
  IconClose,
  IconEye,
  IconEyeOff,
  IconSearch,
  IconAlertTriangle,
} from '../icon-registry'

const ICON_SIZE = 16

function TooltipIcon({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return <span className="smart-input-tooltip" data-tooltip={label}>{children}</span>
}

export interface SmartSuggestion {
  id: string
  label: string
  value: string
  group?: string
  description?: string
  avatar?: string
}

export type SmartValidationState = 'default' | 'success' | 'error'

export interface SmartInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange'> {
  id?: string
  label: string
  prefixIcon?: React.ReactNode
  clearable?: boolean
  searchable?: boolean
  suggestions?: SmartSuggestion[]
  validation?: SmartValidationState
  validationLabel?: string
  validationMessage?: string
  error?: string
  helperText?: string
  noResultsText?: string
  suggestionsLabel?: string
  clearLabel?: string
  showPasswordLabel?: string
  hidePasswordLabel?: string
  searchLabel?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClear?: () => void
  onSearch?: (value: string) => void
  onSuggestionSelect?: (suggestion: SmartSuggestion) => void
}

function getInitials(label: string) {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function highlightMatch(label: string, query: string) {
  if (!query) return label
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = label.split(new RegExp(`(${escapedQuery})`, 'ig'))
  return parts.map((part, index) => part.toLocaleLowerCase() === query.toLocaleLowerCase() ? <mark key={`${part}-${index}`}>{part}</mark> : part)
}

/**
 * SmartInput - حقل إدخال موحّد بيدعم التحقق، الاقتراحات، والأزرار الداخلية.
 * @param props - إعدادات الحقل وسلوك callbacks.
 * @returns عنصر إدخال قابل لإعادة الاستخدام.
 */
export const SmartInput = React.forwardRef<HTMLInputElement, SmartInputProps>(function SmartInput(
  {
    id,
    label,
    prefixIcon,
    clearable,
    searchable,
    suggestions = [],
    validation = 'default',
    validationLabel,
    validationMessage,
    error,
    helperText,
    noResultsText = 'No results',
    suggestionsLabel = `${label} suggestions`,
    clearLabel = 'Clear',
    showPasswordLabel = 'Show password',
    hidePasswordLabel = 'Hide password',
    searchLabel = 'Search',
    onChange,
    onClear,
    onSearch,
    onSuggestionSelect,
    value,
    defaultValue,
    type = 'text',
    disabled,
    className,
    onFocus,
    onBlur,
    readOnly,
    required,
    ...props
  },
  ref,
) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const listId = `${inputId}-suggestions`
  const descriptionId = error || helperText || validationMessage ? `${inputId}-description` : undefined
  const validationId = validation !== 'default' ? `${inputId}-validation` : undefined
  const [innerValue, setInnerValue] = React.useState(String(defaultValue ?? ''))
  const [open, setOpen] = React.useState(false)
  const [hasFocus, setHasFocus] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const [showPassword, setShowPassword] = React.useState(false)
  const [autofillGuard, setAutofillGuard] = React.useState(true)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const currentValue = value === undefined ? innerValue : String(value)
  const filtered = suggestions.filter((item) => item.label.toLocaleLowerCase().includes(currentValue.toLocaleLowerCase()))
  const groups = filtered.reduce<Record<string, SmartSuggestion[]>>((result, item) => {
    const group = item.group ?? ''
    ;(result[group] ??= []).push(item)
    return result
  }, {})
  const active = activeIndex >= 0 ? filtered[activeIndex] : undefined
  const isInvalid = validation === 'error' || Boolean(error)
  const descriptionText = error ?? helperText
  const actionVisible = hasFocus || Boolean(currentValue)
  const canClear = (clearable ?? true) && Boolean(currentValue) && actionVisible
  const canTogglePassword = type === 'password' && Boolean(currentValue) && actionVisible
  const canSearch = searchable && Boolean(currentValue) && actionVisible

  React.useEffect(() => {
    const timer = window.setTimeout(() => setAutofillGuard(false), 350)
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  function update(next: string) {
    setInnerValue(next)
    setOpen(suggestions.length > 0)
    setActiveIndex(-1)
  }

  function select(item: SmartSuggestion) {
    update(item.value)
    onChange?.({ target: { value: item.value } } as React.ChangeEvent<HTMLInputElement>)
    onSuggestionSelect?.(item)
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    if (event.key === 'Escape') { setOpen(false); setActiveIndex(-1); return }
    if (event.key === 'ArrowDown' && filtered.length) { event.preventDefault(); setOpen(true); setActiveIndex((index) => (index + 1) % filtered.length); return }
    if (event.key === 'ArrowUp' && filtered.length) { event.preventDefault(); setOpen(true); setActiveIndex((index) => (index - 1 + filtered.length) % filtered.length); return }
    if (event.key === 'Home' && open && filtered.length) { event.preventDefault(); setActiveIndex(0); return }
    if (event.key === 'End' && open && filtered.length) { event.preventDefault(); setActiveIndex(filtered.length - 1); return }
    if (event.key === 'Tab') { setOpen(false); setActiveIndex(-1); return }
    if (event.key === 'Enter' && active) { event.preventDefault(); select(active); return }
    if (event.key === 'Enter' && searchable && (event.ctrlKey || !active)) { event.preventDefault(); onSearch?.(currentValue); return }
    if (event.key === 'Backspace' && event.ctrlKey) { event.preventDefault(); update('') }
  }

  function handleClear() {
    update('')
    onClear?.()
  }

  return (
    <div ref={rootRef} className={`smart-input ${className ?? ''}`} data-validation={validation} data-disabled={disabled ? 'true' : 'false'}>
      <div className="smart-input-control">
        {prefixIcon ? <span className="smart-input-prefix" aria-hidden="true">{prefixIcon}</span> : null}
        <input
          {...props}
          ref={ref}
          id={inputId}
          type={type === 'password' && showPassword ? 'text' : type}
          value={currentValue}
          disabled={disabled}
          readOnly={autofillGuard || readOnly}
          placeholder=" "
          autoComplete={props.autoComplete ?? (type === 'password' ? 'new-password' : 'off')}
          autoCapitalize={props.autoCapitalize ?? 'none'}
          autoCorrect={props.autoCorrect ?? 'off'}
          spellCheck={props.spellCheck ?? false}
          data-1p-ignore="true"
          data-lpignore="true"
          data-bwignore="true"
          data-form-type="other"
          aria-label={props['aria-label'] ?? label}
          aria-required={required || undefined}
          aria-invalid={isInvalid || undefined}
          aria-describedby={[descriptionId, validationId].filter(Boolean).join(' ') || undefined}
          aria-errormessage={error ? descriptionId : undefined}
          aria-autocomplete={suggestions.length ? 'list' : undefined}
          aria-haspopup={suggestions.length ? 'listbox' : undefined}
          aria-expanded={suggestions.length ? open : undefined}
          role={suggestions.length ? 'combobox' : undefined}
          aria-controls={open && suggestions.length ? listId : undefined}
          aria-activedescendant={active ? `${listId}-${active.id}` : undefined}
          onFocus={(event) => { setAutofillGuard(false); setHasFocus(true); onFocus?.(event); if (suggestions.length) setOpen(true) }}
          onBlur={(event) => { setHasFocus(false); onBlur?.(event) }}
          onChange={(event) => { update(event.target.value); onChange?.(event) }}
          onKeyDown={handleKeyDown}
        />
          <label htmlFor={inputId}>{label}</label>
        {validation !== 'default' ? (
          <TooltipIcon label={validationLabel ?? (validation === 'success' ? 'Valid' : 'Invalid')}>
            <span id={validationId} className="smart-input-validation" role="status" aria-label={validationLabel ?? validation} aria-live="polite">
              {validation === 'success' ? <IconCheckCircle size={ICON_SIZE} aria-hidden="true" /> : <IconAlertTriangle size={ICON_SIZE} aria-hidden="true" />}
            </span>
          </TooltipIcon>
        ) : null}
        {canClear ? <button type="button" className="smart-input-action" aria-label={`${clearLabel} ${label}`} title={`${clearLabel} ${label}`} tabIndex={-1} disabled={disabled} onClick={handleClear}><IconClose size={ICON_SIZE} aria-hidden="true" /></button> : null}
        {canTogglePassword ? <button type="button" className="smart-input-action" aria-label={showPassword ? hidePasswordLabel : showPasswordLabel} title={showPassword ? hidePasswordLabel : showPasswordLabel} aria-pressed={showPassword} tabIndex={-1} disabled={disabled} onClick={() => setShowPassword((state) => !state)}>{showPassword ? <IconEyeOff size={ICON_SIZE} aria-hidden="true" /> : <IconEye size={ICON_SIZE} aria-hidden="true" />}</button> : null}
        {canSearch ? <button type="button" className="smart-input-action" aria-label={`${searchLabel} ${label}`} title={`${searchLabel} ${label}`} tabIndex={-1} disabled={disabled} onClick={() => onSearch?.(currentValue)}><IconSearch size={ICON_SIZE} aria-hidden="true" /></button> : null}
      </div>
      {open && suggestions.length ? (
        <div id={listId} className="smart-input-list" role="listbox" aria-label={suggestionsLabel}>
          {Object.entries(groups).map(([group, items]) => (
            <React.Fragment key={group || 'ungrouped'}>
              {group ? <div className="smart-input-group" role="presentation">{group}</div> : null}
              {items.map((item) => {
                const index = filtered.indexOf(item)
                return <button key={item.id} id={`${listId}-${item.id}`} type="button" role="option" aria-selected={index === activeIndex} className="smart-input-option" onMouseDown={(event) => event.preventDefault()} onClick={() => select(item)}><span className="smart-input-option-main">{item.avatar ? <img src={item.avatar} alt="" /> : <span className="smart-input-avatar" aria-hidden="true">{getInitials(item.label)}</span>}<span>{highlightMatch(item.label, currentValue)}</span>{index === activeIndex ? <span className="smart-input-option-arrow" aria-hidden="true">›</span> : null}</span>{item.description ? <small>{item.description}</small> : null}</button>
              })}
            </React.Fragment>
          ))}
          {!filtered.length ? <div className="smart-input-empty" role="status">{noResultsText}</div> : null}
        </div>
      ) : null}
      {descriptionText || validationMessage ? <p id={descriptionId} className="smart-input-description" role={error ? 'alert' : undefined} aria-live={error ? 'assertive' : 'polite'} aria-atomic="true">{descriptionText ?? validationMessage}</p> : null}
    </div>
  )
})

SmartInput.displayName = 'SmartInput'

export default SmartInput
