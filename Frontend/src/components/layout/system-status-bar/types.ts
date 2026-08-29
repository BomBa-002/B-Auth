export type StatusTone = 'ready' | 'busy' | 'error'

export interface SystemStatusBarProps {
  version?: string
  brand?: string
  environment?: string
  tagline?: string
  tone?: StatusTone
  label?: string
}
