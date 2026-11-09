# Specification: Custom Background and Appearance Settings

## 1. Appearance Settings Data Model & Scope Contracts
- The system SHALL define an immutable state interface `AppearanceSettings`:
  - `scope`: `'window' | 'stage'`
  - `type`: `'fluid' | 'image_upload' | 'image_url'`
  - `imageUrl`: string (Base64 data or web URL)
  - `opacity`: number between `0.0` and `1.0` (default: `0.35`)
  - `blur`: number between `0` and `40` px (default: `24`)
  - `overlayDarkness`: number between `0.0` and `0.8` (default: `0.30`)
- When `scope === 'window'`, the background image/fluid SHALL render behind the entire viewport root, penetrating the translucent Sidebar and Header.
- When `scope === 'stage'`, the custom background SHALL be strictly clipped within the central `SlotContainer` card boundaries.

## 2. Settings View Architecture & Sub-navigation
- When `activeModule === 'settings'`, `SlotContainer` SHALL render the dedicated `SettingsView` component instead of generic placeholder text.
- `SettingsView` SHALL incorporate a modular sub-category navigation:
  - Active tab: `外观与背景 (Appearance & Background)`
  - Future tabs: `通用设置 (General)`, `快捷键 (Shortcuts)`, `关于 (About)` (rendered in disabled/preview status).
- All input controls (segmented switches, file pickers, sliders) SHALL conform to the black-gray-white translucent glass aesthetic and stationary zero-jitter tactile button interactions.

## 3. Real-Time Optical Feedback & Contrast Defense
- Changes to any slider or selector SHALL react immediately without debounce lag on UI rendering.
- The dark overlay dimmer SHALL be positioned between the background image and the typography/controls layer, guaranteeing WCAG 2.2 AA contrast regardless of user image luminance.

## 4. Local-First Persistence & Hydration
- Every modification to `AppearanceSettings` SHALL immediately be serialized to `localStorage` under key `selfwork_appearance_settings`.
- During application bootstrap, the settings SHALL be synchronously hydrated; if absent or corrupted, the system SHALL fallback to `DEFAULT_APPEARANCE_SETTINGS`.

## 5. Architectural Invariants Preservation
- Layout baselines (Y=44px, single border spine) SHALL remain pixel-exact.
- Typography rasterization SHALL remain fixed with zero `scale()` vibration during clicks.
