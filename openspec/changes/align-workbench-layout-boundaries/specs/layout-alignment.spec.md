# Specification: Workbench Layout Alignment and Hairline Contracts

## 1. Top Navigation & Sidebar Horizontal Baseline
- The top boundary container of both Sidebar and Header SHALL have an identical computed height of `44px` (`h-11`).
- The bottom hairline of the Sidebar brand zone and the bottom hairline of the Header SHALL align at the exact same Y-axis coordinate without any subpixel discrepancy.
- The horizontal divider SHALL share the identical border color definition (`border-border-default`) across Sidebar and Header.

## 2. Junction Topology & Border Ownership
- The layout SHALL enforce the Single-Border Ownership axiom: adjacent containers SHALL NOT both declare overlapping borders.
- The vertical spine border separating the Sidebar from the main content viewport SHALL be owned exclusively by the `Sidebar`'s right border (`border-r`).
- The junction point between the vertical spine and the horizontal baseline SHALL form a clean, mathematically orthogonal T-junction without overlapping pseudo-shadow spots or phantom line fragments.

## 3. Main Content Viewport Seamless Integration
- The main content area (`SlotContainer`) SHALL directly align against the Header's bottom border and the Sidebar's right border without floating gaps or disconnected dead-zones.
- The inner canvas card SHALL have balanced internal margins, with border weights strictly restricted to `1px`.

## 4. Anti-Hack Constraint
- All alignment SHALL be achieved via flex-basis, flex-grow, height, and border containment.
- Implementation SHALL NOT use negative margins (`margin: -1px`), arbitrary transforms, or absolute position hacks to mask layout misalignments.
