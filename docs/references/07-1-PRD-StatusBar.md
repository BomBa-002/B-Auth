# 📄 System Status Bar — PRD & SOP

---

## 🎯 1. Product Requirements Document (PRD)

### 🧭 Overview
The `SystemStatusBar` is a professional, animated, and highly responsive component designed for Vite 6 + React 19 + TypeScript. It follows a **Soft Glass Neumorphism** design language and provides a unified top-level status interface.

### 🏠 Architecture (Logical Three-Zone)
The bar is divided into three zones using **Logical Properties** (Start/End) to ensure seamless RTL/LTR transitions:
- **[START ZONE]:** System Health (Pulse Dot), Version Badge, and Environment Tag.
- **[CENTER ZONE]:** Branding (Logo, Name, and Tagline).
- **[END ZONE]:** User Actions (12h Live Clock, Language Toggle, Theme Toggle, Notification Popover, and Settings Drawer).

### ✨ Core Features & Specifications
1.  **Height:** Strictly `1.5em` for a compact, professional look.
2.  **Clock System:**
    *   **Main Display:** 12-hour format (`hh:mm A` / `٠٢:٣٠ م`).
    *   **Professional Tooltip:** On hover, shows:
        *   **24h Cairo Time:** Detailed time in `Africa/Cairo` zone.
        *   **Gregorian Date:** `Tuesday : 12 - (05 - May) - 2026 AD`.
        *   **Hijri Date (Umm al-Qura):** `Tuesday : 25 - (11 - Dhu al-Qi'dah) - 1447 AH`.
3.  **Responsive Design:** Mobile-first approach. Elements hide/scale based on screen width.
4.  **Umm al-Qura Accuracy:** Forced `islamic-umalqura` calendar for religious and civil accuracy in the Arab region.
4.  **Internationalization (i18n):** 
    *   **Primary:** English (LTR).
    *   **Secondary:** Arabic (RTL).
    *   **Logic:** Uses `i18next` and CSS Logical Properties (`inline-start`, `end-0`, `border-s`).
5.  **Interactive Overlays:** Uses Radix UI for high-performance Popovers and Drawers.

---

## 🎨 2. Design System (Neumorphic Glass)

### 🎨 Colors (HSL)
- **Background:** `hsl(30 20% 98%)` (Light) | `hsl(220 15% 12%)` (Dark).
- **Accent:** `hsl(45 85% 62%)` (Gold).
- **Status:** Online (Green), Degraded (Yellow), Offline (Red).

### 🌑 Shadows & Depth
- **Raised:** Double shadow (`drop-shadow` for the bar, `box-shadow` for elements).
- **Pressed:** Inset shadows (`--ssb-neu-inset`) for `:active` states.
- **Glass Effect:** `backdrop-filter: blur(12px)` with subtle white borders.

---

## 🛠️ 3. Standard Operating Procedure (SOP)

### Phase 1: File Structure
```text
src/components/SystemStatusBar/
├── elements/          # Atomic components (Clock, Badges, etc.)
├── hooks/             # Business logic (useLiveClock, useSystemStatus)
├── zones/             # Layout zones (StartZone, CenterZone, EndZone)
├── types.ts           # Type definitions
├── SystemStatusBar.tsx # Main Entry
└── SystemStatusBar.css # Design Tokens & Styles
```

### Phase 2: Implementation Guidelines for AI
1.  **Logical Properties First:** Never use `left` or `right`. Always use `start` and `end` (e.g., `padding-inline-start`, `inset-inline-end`).
2.  **Date Logic:** Use `Intl.DateTimeFormat` for all dates to ensure local accuracy for Hijri and Gregorian names. 
    *   *Note:* Timezone for Cairo is hardcoded as `Africa/Cairo` for now; future implementation should load this from a global `RegionSettings` context.
3.  **Neumorphism:** maintain the `0.15em` shadow depth and `var(--r-md)` corner radius.
4.  **Transitions:** Use Framer Motion for entrance (`spring`) and exit animations.

### Phase 3: Accessibility & i18n
- Ensure `document.documentElement.dir` is updated on language change.
- Use `aria-live="polite"` for the status pulse.
- All buttons must have `aria-label`.

---

## 🚀 4. Future Roadmap
- [ ] **System Settings Integration:** Build a global context for `Country` and `City`.
- [ ] **Dynamic Timezone:** Replace the hardcoded Cairo timezone with a value from the user settings.
- [ ] **API Integration:** Connect the status indicator to a real health-check endpoint.

---
*Document Version: 1.1.0*
*Created for: AI-Driven Development*
