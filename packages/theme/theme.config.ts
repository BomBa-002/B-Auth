/**
 * @b-auth/theme — central design tokens.
 *
 * These are the single source of truth for color. `@b-auth/design-system`
 * turns this object into CSS variables (`styles/tokens.css`) consumed by
 * Tailwind v4's `@theme inline`. Never hardcode hex/HSL values in app code —
 * always go through the semantic Tailwind classes these tokens back
 * (bg-background, text-foreground, bg-primary, etc.).
 *
 * Visual direction: technical / precise identity-console aesthetic — calm
 * neutral graphite surface, one confident indigo accent, no decorative
 * gradients. Values are HSL triplets (no "hsl()" wrapper) so CSS can compose
 * them as `hsl(var(--background))`.
 */

export interface ThemeTokens {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  success: string
  successForeground: string
  border: string
  input: string
  ring: string
}

export const radius = "0.5rem"

export const lightTheme: ThemeTokens = {
  background: "40 20% 98%",
  foreground: "222 18% 12%",
  card: "0 0% 100%",
  cardForeground: "222 18% 12%",
  popover: "0 0% 100%",
  popoverForeground: "222 18% 12%",
  primary: "231 62% 45%",
  primaryForeground: "0 0% 100%",
  secondary: "222 14% 94%",
  secondaryForeground: "222 18% 16%",
  muted: "222 14% 95%",
  mutedForeground: "222 10% 42%",
  accent: "231 62% 45%",
  accentForeground: "0 0% 100%",
  destructive: "4 72% 48%",
  destructiveForeground: "0 0% 100%",
  success: "152 60% 32%",
  successForeground: "0 0% 100%",
  border: "222 14% 88%",
  input: "222 14% 88%",
  ring: "231 62% 45%",
}

export const darkTheme: ThemeTokens = {
  background: "224 22% 8%",
  foreground: "210 20% 94%",
  card: "224 20% 11%",
  cardForeground: "210 20% 94%",
  popover: "224 20% 11%",
  popoverForeground: "210 20% 94%",
  primary: "228 78% 66%",
  primaryForeground: "224 30% 10%",
  secondary: "224 16% 16%",
  secondaryForeground: "210 20% 90%",
  muted: "224 16% 15%",
  mutedForeground: "218 12% 60%",
  accent: "228 78% 66%",
  accentForeground: "224 30% 10%",
  destructive: "4 78% 62%",
  destructiveForeground: "224 30% 10%",
  success: "152 55% 48%",
  successForeground: "224 30% 10%",
  border: "224 16% 18%",
  input: "224 16% 18%",
  ring: "228 78% 66%",
}

export const fonts = {
  sans: "'Geist', 'Geist Fallback', system-ui, sans-serif",
  mono: "'Geist Mono', 'Geist Mono Fallback', ui-monospace, monospace",
}

export const themes = { light: lightTheme, dark: darkTheme }
