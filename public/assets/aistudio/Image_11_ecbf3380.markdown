---
name: TaskFlow Core
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a focused, calm, and highly structured environment for task management and personal productivity. It targets professionals, knowledge workers, and students who require immediate visual clarity without visual noise or cognitive friction. 

The aesthetic is built upon **Modern Minimalism** with tactile structural discipline. It prioritizes information hierarchy through crisp micro-borders, airy whitespace, and subtle elevation changes rather than heavy ornamentation. The interface feels lightweight, responsive, and organized—delivering a sense of accomplishment, momentum, and control over daily workflows.

## Colors

The palette leverages a crisp, high-clarity light mode foundation to emphasize content readability and state perception.

- **Background & Canvas:** Crisp off-white (`#F8FAFC`) anchors the page canvas, reducing eye fatigue compared to pure white while creating natural contrast against foreground panels.
- **Surfaces & Cards:** Pure white (`#FFFFFF`) isolates interactive items, task lists, and modals from the background canvas.
- **Borders & Dividers:** Subtle slate border (`#E2E8F0`) provides structural definition without visual heaviness.
- **Typography:** Deep slate (`#0F172A`) serves as primary text for high legibility; muted slate (`#64748B`) governs metadata, labels, and secondary details.
- **Primary Brand Accent:** Vibrant indigo (`#4F46E5`) drives interactive affordance, primary CTAs, active filter states, and check selections. Its soft companion tint (`#EEF2FF`) provides low-contrast fills for active selections and hovered navigation.
- **Semantic Tag Roles:** 
  - *Study:* Blue text/border (`#3B82F6`) over subtle blue fill (`#EFF6FF`).
  - *Projects:* Emerald text/border (`#10B981`) over soft emerald fill (`#ECFDF5`).
  - *Personal:* Amber text/border (`#F59E0B`) over warm amber fill (`#FEF3C7`).

## Typography

The typography is built entirely on **Inter** to ensure maximum legibility, strict geometric regularity, and neutral tone across all device resolutions. 

Titles and section headings use tighter negative letter spacing (`-0.01em` to `-0.02em`) to produce a modern, publication-grade feel. Body text stays neutral at `0` tracking for effortless scanning across nested task trees. Labels, badges, and tag chips adopt slightly boosted font weights (`500` and `600`) with proportional vertical rhythm to maintain legibility at small sizes.

## Layout & Spacing

The layout utilizes a structured responsive grid system with generous outer padding to preserve focus and breathing room.

- **Desktop (1024px+):** Centered application frame (max-width `1280px`) featuring a collapsible lateral navigation sidebar (`260px`) and an active workspace area governed by a fluid column layout with `1.5rem` gutters and `2.5rem` outer margins.
- **Tablet (768px – 1023px):** Simplified two-pane or drawer navigation with `1rem` gutters and `1.5rem` canvas margins.
- **Mobile (< 768px):** Single-column stacked view with fixed bottom action bars, `1rem` canvas margins, and edge-to-edge compact list items to preserve horizontal thumb-reach.

Component gaps follow an explicit 4px / 8px scale: micro gaps between icons and labels use `space-xs` (4px) or `space-sm` (8px); task item internal padding uses `space-md` (16px); section separators and card containers use `space-lg` (24px) or `space-xl` (32px).

## Elevation & Depth

Depth is established primarily through **structural layer contrast** paired with precise, whisper-thin ambient shadows. Heavy drops and saturated blur halos are prohibited.

- **Level 0 (Canvas):** Flat `#F8FAFC`, no shadow.
- **Level 1 (Cards, List Panels, Inputs):** Solid `#FFFFFF` fill resting on the canvas, bounded by a continuous `1px solid #E2E8F0` border and reinforced with a crisp shadow: `0 1px 2px 0 rgba(15, 23, 42, 0.05)`.
- **Level 2 (Hovered Cards, Dropdowns, Popovers):** Solid `#FFFFFF`, `1px solid #E2E8F0`, with elevated shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Level 3 (Modals, Slide-over Panes):** Solid `#FFFFFF` with backdrop overlay (`#0F172A` at 20% opacity), elevated shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.

## Shapes

The design uses a unified corner radius standard calibrated to **10px** for interactive cards and primary containers.

- **Task Cards & Panels:** Fixed `10px` (`rounded-xl` in standard scales) to soften boundaries while maintaining a clean, technical grid.
- **Form Controls & Buttons:** `8px` (`rounded-lg`) to provide distinct button geometry and tactile feel.
- **Badges, Priority Indicators & Tags:** Pill-shaped (`9999px`) or `6px` depending on data density, ensuring tags stand out against rectangular task rows.

## Components

### Buttons
- **Primary:** Background `#4F46E5`, text `#FFFFFF`, border none, 8px border radius, medium weight (`label-md`). Hover state `#4338CA`. Active state `#3730A3`. Focus ring: 2px offset with 2px `#4F46E5` outline.
- **Secondary / Ghost:** Background transparent or `#FFFFFF`, 1px border `#E2E8F0`, text `#0F172A`. Hover: background `#F8FAFC`, border `#CBD5E1`.
- **Icon Buttons:** Pure outline iconography (1.5px or 2px stroke width, 20px bounding box), square ratio, 8px border radius, `#64748B` default, `#0F172A` on hover.

### Checkboxes & Completion Affordances
- **Default State:** 18px box, 4px roundedness, 1.5px border `#CBD5E1`, background `#FFFFFF`.
- **Hover:** Border shifts to `#4F46E5`.
- **Checked State:** Background `#4F46E5`, border `#4F46E5`, crisp white checkmark icon (`stroke-width: 2.5`). Task label simultaneously transitions to `#64748B` with a continuous strikethrough.

### Task Cards & Rows
- Pure white background (`#FFFFFF`), `10px` corner radius, `1px solid #E2E8F0` border, `shadow-sm`.
- Padding is compact (`12px 16px`) for high-density lists, expanding to `16px 20px` for kanban cards.
- Hover brings a subtle border transition to `#CBD5E1` and micro-elevation to Level 2.

### Tag Chips & Badges
- Height: 24px, vertical centering, `label-xs` typography, 9999px pill radius.
- Padding: 4px horizontal, 8px vertical.
- **Study:** Background `#EFF6FF`, border `1px solid #DBEAFE`, text `#3B82F6`.
- **Projects:** Background `#ECFDF5`, border `1px solid #A7F3D0`, text `#10B981`.
- **Personal:** Background `#FEF3C7`, border `1px solid #FDE68A`, text `#D97706`.

### Form Fields & Inputs
- Height 40px, background `#FFFFFF`, border `1px solid #E2E8F0`, 8px corner radius, text `#0F172A`.
- Placeholder text `#94A3B8`.
- Focus: border color `#4F46E5`, soft shadow ring `0 0 0 3px #EEF2FF`.

### Quick-Add Inline Bar
- Persistent or floating quick-entry bar at the top or base of task views. Features an input field seamlessly embedded with a leading `+` outline icon, auto-detect tags, and an active indigo return key shortcut indicator.