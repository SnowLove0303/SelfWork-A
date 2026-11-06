# Specification: Monochrome Frosted Glass and Tactile UI

## 1. Color System & Radical Monochrome Economy
- The application SHALL use a monochrome palette restricted to cold near-black, charcoal gray, zinc, and varying opacities of white.
- Text contrast SHALL strictly adhere to WCAG 2.2 AA standards:
  - Primary text: `rgba(255, 255, 255, 0.95)` (`#f8fafc`)
  - Secondary text: `rgba(255, 255, 255, 0.65)` (`#94a3b8`)
  - Muted/caption text: `rgba(255, 255, 255, 0.40)` (`#64748b`)

## 2. Frosted Glass (Glassmorphism / Acrylic) Materials
- Containers (Header, Sidebar, Main Slot, Floating Cards) SHALL apply `backdrop-filter: blur(...)` combined with translucent dark tinted backgrounds.
- The base background opacity of major panels SHALL remain between 60% and 80% to ensure optimal readability while establishing visual depth.
- Container borders SHALL use hairline translucent white edges (`rgba(255, 255, 255, 0.08)`) to outline physical glass boundaries.

## 3. Tactile Button Dynamics & Inner Rim Lighting
- Interactive buttons and control pills SHALL feature physical depth through an inner top highlight edge (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12)`).
- On pointer hover:
  - The button SHALL increase surface brightness (`bg-white/[0.06]`) and raise rim light intensity (`inset 0 1px 0 rgba(255, 255, 255, 0.18)`).
- On pointer active (press):
  - The button SHALL trigger a physical depress micro-interaction (`transform: scale(0.97)` or `translate-y-0.5`), accompanied by an inset shadow indicating compression.
  - The transition timing SHALL be snappy (`100ms~150ms ease-out`).

## 4. Preservation of Architectural Invariants
- The layout SHALL preserve the Single-Border Ownership axiom established in previous specifications.
- The alignment between Sidebar Brand and Header SHALL remain locked at `h-11` (44px) without subpixel drift.
- Microsoft YaHei font, fluid-glowing SW logo, and console-free Windows subsystem SHALL remain intact.
