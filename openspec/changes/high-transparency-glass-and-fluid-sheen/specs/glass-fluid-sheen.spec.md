# Specification: High-Transparency Crystal Glass and Fluid Sheen

## 1. Transparency Range & Crystal Refraction Contracts
- The opacity of major panel backdrops (Header, Sidebar, Main Slot) SHALL be calibrated between `25%` and `40%`.
- The backdrop filter blur SHALL be increased to `20px ~ 24px` (`backdrop-blur-xl`), ensuring high readability while preserving crystal translucency.
- Text layers SHALL maintain high contrast (`WCAG 2.2 AA`) over moving ambient fluid lights.

## 2. Fluid Ambient Light & Dynamic Sheen Mechanics
- The system SHALL include a gentle, continuous background ambient fluid light mesh (`@keyframes fluidGlowMesh`) that drifts smoothly behind the transparent glass panels.
- Active selection indicators and highlight rims SHALL feature fluid light accents that enhance spatial depth without blinding glare.
- The animations SHALL use GPU-accelerated compositing (`transform`, `opacity`) and smooth infinite cubic-bezier timing functions.

## 3. Stationary Typography & Zero-Jitter Tactile Interaction
- Interactive controls (`.tactile-btn`, `.tactile-pill`) SHALL NOT apply `transform: scale(...)` or `transform: translateY(...)` during pointer `:active` state.
- Button text and child icons SHALL remain at fixed subpixel raster positions with zero spatial perturbation during click transitions.
- Tactile feedback SHALL be delivered strictly through optical depth variations:
  - Surface compression via `inset 0 1px 3px 0 rgba(0, 0, 0, 0.6)`
  - Surface light depletion via subtle background tint deepening
  - Top highlight edge relaxation.

## 4. Preservation of Alignment & Subsystem Invariants
- The layout SHALL preserve the Single-Border Ownership axiom.
- The `44px` (`h-11`) horizontal baseline across Sidebar Brand and Header SHALL remain unchanged.
- Microsoft YaHei font, fluid-glowing SW logo, and console-free Windows subsystem SHALL remain intact.
