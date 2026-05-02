# Plan: Admin Mobile UX Refinement

## Overview
The current mobile experience for the Admin Panel is degraded. Specific issues identified from user screenshots and reports include:
1. **Sidebar Overlap:** The header/sidebar elements are overlapping on small screens, making navigation difficult.
2. **Displaced Buttons:** The "Salvar" (Save) button and others are misaligned or pushed out of appropriate focal areas on mobile.
3. **Broken Business Hours Layout:** The complex grid/flex layout for setting operating hours breaks down on narrow viewports, causing inputs and labels to overlap or stack incorrectly.
4. **General UI Overlaps:** Various elements across the configuration tabs are overlapping due to rigid widths or lack of responsive wrapping.
5. **Dishes Tab Horizontal Scroll:** In the "Pratos" tab, the list of items requires horizontal scrolling on mobile to access the edit and delete buttons, making management cumbersome.

**Goal:** Refine the CSS and HTML structure of the Admin Panel across all themes to ensure a seamless, fully responsive mobile experience without breaking the desktop layout.

## Project Type
**WEB** (Admin Dashboard Refinement)

## Success Criteria
- [x] Sidebar collapses or adapts correctly on mobile (e.g., hamburger menu toggles a full-height, non-overlapping drawer).
- [x] Business hours configuration is perfectly usable on a 320px wide screen (stacking days and inputs vertically if necessary).
- [x] Floating "Salvar" button remains visible, centered, and accessible without overlapping critical content or footer edges on mobile.
- [x] No horizontal scrolling is forced by overflowing elements, particularly in the "Pratos" (Dishes) list.
- [x] All 4 themes (`restaurante`, `hamburgueria`, `pizzaria`, `confeitaria`) receive the same structural fixes.

## Tech Stack
- HTML5 / Tailwind CSS (Utility classes for responsive design: `sm:`, `md:`, `lg:`)
- Vanilla JavaScript (for any required sidebar toggle logic adjustments)

## File Structure
Changes will be isolated to the admin template and potentially core CSS/JS if shared logic dictates, across all 4 themes:
- `themes/restaurante/admin.html`
- `themes/hamburgueria/admin.html`
- `themes/pizzaria/admin.html`
- `themes/confeitaria/admin.html`

## Task Breakdown

### Task 1: Fix Sidebar & Header Overlaps
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`, `tailwind-patterns`
- **Priority:** P1
- **INPUT:** Current `admin.html` sidebar/header HTML structure.
- **OUTPUT:** Updated Tailwind classes ensuring the sidebar acts as a proper mobile drawer (`fixed`, `inset-y-0`, `z-50`, with backdrop) driven by the existing hamburger menu toggle, preventing content overlap.
- **VERIFY:** Resize viewport to 375px. Hamburger menu opens sidebar over content with overlay; closing restores normal view.

### Task 2: Refactor Business Hours Layout
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`, `tailwind-patterns`
- **Priority:** P1
- **INPUT:** Business hours container in `admin.html` (`<div class="space-y-4">` containing days, checkboxes, and time selects).
- **OUTPUT:** Modified grid/flex classes to stack inputs vertically on mobile while maintaining the inline row layout on `md:` breakpoints and above.
- **VERIFY:** On mobile, Monday's "Open Time" and "Close Time" select boxes should wrap cleanly without overflowing the screen width.

### Task 3: Address Displaced "Salvar" Button
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P2
- **INPUT:** Floating save button logic and HTML (`#config-save-float`).
- **OUTPUT:** CSS constraints ensuring the button docks cleanly to the bottom of the viewport (`bottom-4`, `inset-x-4`) on mobile, scaling its width appropriately (`w-full` vs fixed width).
- **VERIFY:** Button is completely visible and clickable on mobile when scrolling through the configuration page.

### Task 4: Fix General Layout Overlaps & Padding
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P2
- **INPUT:** Modals, form inputs, and tab content areas in `admin.html`.
- **OUTPUT:** Adjusted main container paddings (`px-4` vs `px-8` on mobile), ensuring input fields stretch to `w-full` rather than fixed pixels, and modals use `w-full max-w-lg mx-auto` spacing.
- **VERIFY:** Visual check of all tabs on a mobile viewport. No elements exceed viewport width.

### Task 5: Improve Dishes (Pratos) Tab Mobile Layout
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P1
- **INPUT:** Dishes list container in `admin.html`.
- **OUTPUT:** Refactor the list items (which currently force horizontal scrolling) into a responsive card layout or a vertical stack on mobile, ensuring edit/delete buttons are visible without scrolling.
- **VERIFY:** On mobile viewport, Edit and Delete buttons for dishes are immediately accessible.

### Task 6: Propagate Fixes to All Themes
- **Agent:** `orchestrator` / `frontend-specialist`
- **Skill:** `app-builder`
- **Priority:** P1
- **INPUT:** Verified fixes from Task 1-4 on the first theme (`restaurante`).
- **OUTPUT:** Exact same structural HTML/CSS adjustments applied to the `admin.html` of `hamburgueria`, `pizzaria`, and `confeitaria`.
- **VERIFY:** Mobile layout is consistent and fully functional across all four theme admin panels.

## Phase X: Verification
- [x] **Lint:** Tailind classes are valid.
- [x] **UX Audit:** Adjusted for better usability on narrow (320px) mobile viewports.
- [x] **Visual Test:** Manual verification using browser DevTools (Mobile View) across iPhone SE and Android device dimensions.
- [x] No purple/violet hex codes used.
- [x] Socratic gate respected.
