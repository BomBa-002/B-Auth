import * as React from "react"

export interface SmartSuggestion { id: string; label: string; value: string; group?: string; description?: string }
export type SmartValidationState = "default" | "success" | "error"
export interface SmartInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "onChange"> {
  id?: string
  label: string
  prefixIcon?: React.ReactNode
  clearable?: boolean
  searchable?: boolean
  suggestions?: SmartSuggestion[]
  validation?: SmartValidationState
  error?: string
  helperText?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSearch?: (value: string) => void
  onSuggestionSelect?: (suggestion: SmartSuggestion) => void
}

export const SmartInput = React.forwardRef<HTMLInputElement, SmartInputProps>(function SmartInput(
  { id, label, prefixIcon, clearable, searchable, suggestions = [], validation = "default", error, helperText, onChange, onSearch, onSuggestionSelect, value, defaultValue, type = "text", disabled, className, ...props },
  ref,
) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const listId = `${inputId}-suggestions`
  const descriptionId = error || helperText ? `${inputId}-description` : undefined
  const [innerValue, setInnerValue] = React.useState(String(defaultValue ?? ""))
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const [showPassword, setShowPassword] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const currentValue = value === undefined ? innerValue : String(value)
  const filtered = suggestions.filter((item) => item.label.toLocaleLowerCase().includes(currentValue.toLocaleLowerCase()))
  const groups = filtered.reduce<Record<string, SmartSuggestion[]>>((result, item) => { (result[item.group ?? ""] ??= []).push(item); return result }, {})
  const active = filtered[activeIndex]

  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [])

  function update(next: string) {
    setInnerValue(next); setOpen(suggestions.length > 0); setActiveIndex(-1)
  }
  function select(item: SmartSuggestion) {
    update(item.value); onSuggestionSelect?.(item); setOpen(false)
  }
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") { setOpen(false); return }
    if (event.key === "ArrowDown" && filtered.length) { event.preventDefault(); setActiveIndex((i) => (i + 1) % filtered.length); setOpen(true); return }
    if (event.key === "ArrowUp" && filtered.length) { event.preventDefault(); setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length); return }
    if (event.key === "Enter" && active) { event.preventDefault(); select(active); return }
    if (event.key === "Enter" && searchable) onSearch?.(currentValue)
    if (event.key === "Backspace" && event.ctrlKey) update("")
  }
  return <div ref={rootRef} className={`smart-input ${className ?? ""}`} data-validation={validation} data-disabled={disabled ? "true" : "false"}>
    <div className="smart-input-control">
      {prefixIcon ? <span className="smart-input-prefix" aria-hidden="true">{prefixIcon}</span> : null}
      <input {...props} ref={ref} id={inputId} type={type === "password" && showPassword ? "text" : type} value={currentValue} disabled={disabled} placeholder=" " autoComplete={props.autoComplete ?? "off"} aria-invalid={validation === "error" || undefined} aria-describedby={descriptionId} aria-autocomplete={suggestions.length ? "list" : undefined} aria-controls={open && suggestions.length ? listId : undefined} aria-activedescendant={active ? `${listId}-${active.id}` : undefined} onFocus={() => suggestions.length && setOpen(true)} onChange={(event) => { update(event.target.value); onChange?.(event) }} onKeyDown={handleKeyDown} />
      <label htmlFor={inputId}>{label}</label>
      {clearable && currentValue ? <button type="button" className="smart-input-action" aria-label={`Clear ${label}`} tabIndex={-1} onClick={() => update("")}>×</button> : null}
      {type === "password" ? <button type="button" className="smart-input-action" aria-label={showPassword ? "Hide password" : "Show password"} tabIndex={-1} onClick={() => setShowPassword((s) => !s)}>◉</button> : null}
      {searchable ? <button type="button" className="smart-input-action" aria-label={`Search ${label}`} tabIndex={-1} onClick={() => onSearch?.(currentValue)}>⌕</button> : null}
    </div>
    {open && suggestions.length ? <div id={listId} className="smart-input-list" role="listbox">{Object.entries(groups).map(([group, items]) => <React.Fragment key={group}>{group ? <div className="smart-input-group">{group}</div> : null}{items.map((item) => { const index = filtered.indexOf(item); return <button key={item.id} id={`${listId}-${item.id}`} type="button" role="option" aria-selected={index === activeIndex} className="smart-input-option" onMouseDown={(event) => event.preventDefault()} onClick={() => select(item)}><span>{item.label}</span>{item.description ? <small>{item.description}</small> : null}</button> })}</React.Fragment>)}{!filtered.length ? <div className="smart-input-empty">No results</div> : null}</div> : null}
    {error || helperText ? <p id={descriptionId} className="smart-input-description">{error ?? helperText}</p> : null}
  </div>
})
SmartInput.displayName = "SmartInput"
