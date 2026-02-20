# Plan: UX & Bugs Audit

## 1. Overview
Perform a comprehensive User Experience (UX) and Bug audit across the entire Landpage SaaS application, focusing on the frontend themes (`restaurante`, `hamburgueria`, `confeitaria`) and the admin dashboard. The goal is to ensure a flawless, accessible, and high-converting user journey while squashing any existing UI or functional bugs.

## 2. Project Type
**WEB** (Landing pages and Admin Dashboard)

## 3. Success Criteria
- Zero critical usability bugs (e.g., broken buttons, scrolling issues).
- Full mobile responsiveness across all 3 themes.
- Lighthouse scores > 90 for Performance, Accessibility, Best Practices, and SEO.
- WCAG AA accessibility compliance (color contrast, touch targets, ARIA labels).
- Smooth checkout/cart flow without layout shifts or console errors.

## 4. Tech Stack Context
- Frontend: HTML5, Tailwind CSS, Vanilla JS
- Themes: Single-branch architecture (`themes/` to `public/`)
- Backend: Node.js/Express (API endpoints providing data to the UX)

## 5. File Structure Focus
- `themes/restaurante/*`
- `themes/hamburgueria/*`
- `themes/confeitaria/*`
- Shared JS: `themes/restaurante/js/*`

## 6. Task Breakdown

### Task 1: Automated UX & Accessibility Audits
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`, `performance-profiling`
- **Action**: Run `ux_audit.py`, `accessibility_checker.py`, and `lighthouse_audit.py` to gather baseline metrics and issues.
- **Verify**: Audit reports generated and prioritized.

### Task 2: Manual Flow & Interaction Testing
- **Agent**: `test-engineer` / `frontend-specialist`
- **Skill**: `webapp-testing`
- **Action**: Manually test the critical user journeys (Add to cart, Quick order, WhatsApp checkout, Admin image upload, Settings update). Check for loading states, feedback toasts, and error handling.
- **Verify**: All flows complete successfully without console errors.

### Task 3: Mobile & Responsive Design Review
- **Agent**: `mobile-developer` / `frontend-specialist`
- **Skill**: `mobile-design`
- **Action**: Run `mobile_audit.py`. Vet layout on small screens (iPhone SE) and large screens. Check touch targets (minimum 44x44px), font legibility, and modal behaviors on mobile.
- **Verify**: No horizontal scrolling; touch targets pass guidelines.

### Task 4: UI/UX Bug Triage & Remediation
- **Agent**: `frontend-specialist`
- **Skill**: `clean-code`, `frontend-design`
- **Action**: Fix all identified issues from Tasks 1-3. Ensure changes are applied across ALL themes following `@[memory/cross-theme-html-fixes.md]` rules.
- **Verify**: Re-run automated audits to confirm fixes.

## 7. Phase X: Final Verification
- [ ] Lint: `npm run lint` passes
- [ ] Automated Audits: All `python .agent/skills/...` scripts pass
- [ ] Cross-Theme Check: Fixes applied to all 3 theme folders
- [ ] No Purple/Violet hex codes used in new styles (Purple Ban)
- [ ] Verification Date: [Pending]
