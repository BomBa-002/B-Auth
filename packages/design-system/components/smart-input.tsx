import * as React from "react"

/**
 * @file        : packages/design-system/components/smart-input.tsx
 * @description : حقل إدخال ذكي بوسم عائم، اقتراحات، تحقق، وأدوات وصول.
 * @updated     : [{ "date": "29/08/2026", "version": "2.0.0", "by": ["v0"], "comment": "توسيع SmartInput حسب متطلبات PRD" }]
 */

export interface Suggestion {
  id: string
  name: string
  email?: string
  group?: string
  [key: string]: unknown
}

export type ValidationTone = "error" | "warning" | "info" | "success"

export interface SmartInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string
  id?: string
  error?: string
  helperText?: string
  validation?: { tone: ValidationTone; message: string }
  prefixIcon?: React.ReactNode
  endIcon?: React.ReactNode
  onEndIconClick?: () => void
  endIconLabel?: string
  containerClassName?: string
  success?: boolean
  loading?: boolean
  suggestions?: Suggestion[]
  showOnFocus?: boolean
  minChars?: number
  onSuggestionSelect?: (suggestion: Suggestion) => void
  onSearch?: (value: string) => void
  showClear?: boolean
  showPasswordToggle?: boolean
  showSearchButton?: boolean
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** @description بيحوّل النص لعرض آمن مع تمييز الجزء المطابق للبحث. */
function HighlightedText({ value, query }: { value: string; query: string }) {
  if (!query.trim()) return <>{value}</>
  const parts = value.split(new RegExp(`(${escapeRegExp(query)})`, "ig"))
  return <>{parts.map((part, index) => part.toLowerCase() === query.toLowerCase() ? <mark key={`${part}-${index}`}>{part}</mark> : part)}</>
}

/** @description حقل إدخال كامل يحافظ على سلوك input القياسي ويدعم لوحة المفاتيح وARIA. */
export const SmartInput = React.forwardRef<HTMLInputElement, SmartInputProps>(function SmartInput(
  {
    label, id, error, helperText, validation, prefixIcon, endIcon, onEndIconClick, endIconLabel,
    containerClassName, success, loading, disabled, placeholder, className, type = "text", value,
    defaultValue, onChange, onFocus, onBlur, suggestions = [], showOnFocus = true, minChars = 0,
    onSuggestionSelect, onSearch, showClear = true, showPasswordToggle = true, showSearchButton = false,
    onKeyDown, autoFocus, readOnly, ...props
  }, ref
) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const listId = `${inputId}-suggestions`
  const descriptionId = error || helperText || validation ? `${inputId}-description` : undefined
  const [internalValue, setInternalValue] = React.useState(String(defaultValue ?? ""))
  const [focused, setFocused] = React.useState(Boolean(autoFocus))
  const [passwordVisible, setPasswordVisible] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const inputValue = value === undefined ? internalValue : String(value)
  const isDisabled = Boolean(disabled || loading)
  const isPassword = type === "password"
  const query = inputValue.trim()
  const filteredSuggestions = React.useMemo(() => suggestions.filter((item) => {
    if (!query) return true
    return `${item.name} ${item.email ?? ""}`.toLowerCase().includes(query.toLowerCase())
  }), [suggestions, query])
  const groupedSuggestions = React.useMemo(() => filteredSuggestions.reduce<Record<string, Suggestion[]>>((groups, item) => {
    const group = item.group ?? ""
    ;(groups[group] ??= []).push(item)
    return groups
  }, {}), [filteredSuggestions])
  const listOpen = !isDisabled && focused && filteredSuggestions.length > 0 && (showOnFocus || query.length >= minChars) && (query.length >= minChars)
  const message = error ?? validation?.message ?? helperText
  const tone = error ? "error" : validation?.tone ?? (success ? "success" : undefined)

  React.useEffect(() => { if (!listOpen) setActiveIndex(-1) }, [listOpen])
  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (!(target as HTMLElement).closest(`#${inputId}`)?.parentElement?.parentElement?.contains(target)) setFocused(false)
    }
    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [inputId])

  function updateValue(nextValue: string, event?: React.ChangeEvent<HTMLInputElement>) {
    if (value === undefined) setInternalValue(nextValue)
    if (event) onChange?.(event)
  }

  function selectSuggestion(suggestion: Suggestion) {
    const nextValue = suggestion.email ?? suggestion.name
    setInternalValue(nextValue)
    onSuggestionSelect?.(suggestion)
    setFocused(false)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.ctrlKey && event.key === "Backspace") { updateValue(""); return }
    if (listOpen && event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((current) => (current + 1) % filteredSuggestions.length); return }
    if (listOpen && event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((current) => (current - 1 + filteredSuggestions.length) % filteredSuggestions.length); return }
    if (listOpen && event.key === "Enter" && activeIndex >= 0) { const suggestion = filteredSuggestions[activeIndex]; if (suggestion) { event.preventDefault(); selectSuggestion(suggestion) } return }
    if (event.key === "Escape") { setFocused(false); return }
    if (event.key === "Enter" && event.ctrlKey) { event.preventDefault(); onSearch?.(inputValue); return }
    if (event.key === "Tab") setFocused(false)
    onKeyDown?.(event)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => updateValue(event.target.value, event)
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => { setFocused(false); onBlur?.(event) }
  const controls = !loading && <>
    {showClear && Boolean(inputValue) && <button type="button" className="si-action si-clear" onClick={() => updateValue("")} aria-label="Clear input" tabIndex={-1}>×</button>}
    {isPassword && showPasswordToggle && <button type="button" className="si-action" onClick={() => setPasswordVisible((current) => !current)} aria-label={passwordVisible ? "Hide password" : "Show password"} tabIndex={-1}>◉</button>}
    {showSearchButton && <button type="button" className="si-action" onClick={() => onSearch?.(inputValue)} aria-label="Search" tabIndex={-1}>⌕</button>}
    {endIcon && <button type="button" className="si-end-icon" onClick={onEndIconClick} disabled={isDisabled} aria-label={onEndIconClick ? endIconLabel : undefined} aria-hidden={onEndIconClick ? undefined : true} tabIndex={onEndIconClick ? -1 : -1}>{endIcon}</button>}
  </>

  return <div className={containerClassName ? `si-root ${containerClassName}` : "si-root"} data-error={tone === "error"} data-warning={tone === "warning"} data-info={tone === "info"} data-success={tone === "success"} data-disabled={isDisabled} data-loading={loading}>
    <div className="si-control">
      {prefixIcon && <span className="si-prefix" aria-hidden="true">{prefixIcon}</span>}
      <input {...props} ref={ref} id={inputId} className={className ? `si-input ${className}` : "si-input"} type={isPassword && passwordVisible ? "text" : type} value={value} defaultValue={value === undefined ? defaultValue : undefined} placeholder={placeholder ?? " "} disabled={isDisabled} readOnly={readOnly || (focused ? false : !inputValue)} autoFocus={autoFocus} aria-invalid={tone === "error" ? true : undefined} aria-describedby={descriptionId} aria-busy={loading || undefined} role={suggestions.length ? "combobox" : undefined} aria-controls={suggestions.length ? listId : undefined} aria-expanded={suggestions.length ? listOpen : undefined} aria-activedescendant={activeIndex >= 0 && filteredSuggestions[activeIndex] ? `${listId}-${filteredSuggestions[activeIndex].id}` : undefined} onChange={handleChange} onFocus={(event) => { setFocused(true); onFocus?.(event) }} onBlur={handleBlur} onKeyDown={handleKeyDown} />
      <label htmlFor={inputId} className="si-label">{label}</label>
      {controls}
      {loading && <span className="si-loader" aria-label="Loading" />}
    </div>
    {listOpen && <div id={listId} className="si-listbox" role="listbox">{Object.entries(groupedSuggestions).map(([group, items]) => <React.Fragment key={group || "ungrouped"}>{group && <div className="si-group-label">{group}</div>}{items.map((item) => { const itemIndex = filteredSuggestions.indexOf(item); return <button type="button" id={`${listId}-${item.id}`} className="si-option" role="option" aria-selected={itemIndex === activeIndex} key={item.id} onMouseDown={(event) => event.preventDefault()} onClick={() => selectSuggestion(item)}><span><HighlightedText value={item.name} query={query} />{item.email && <small><HighlightedText value={item.email} query={query} /></small>}</span>{itemIndex === activeIndex && <span className="si-active-indicator" aria-hidden="true">✓</span>}</button>})}</React.Fragment>)}</div>}
    {descriptionId && <p id={descriptionId} className="si-helper" role={tone === "error" ? "alert" : undefined}>{message}</p>}
  </div>
})
SmartInput.displayName = "SmartInput"
export type { SmartInputProps as T_SmartInputProps }
export type { Suggestion as T_Suggestion }
