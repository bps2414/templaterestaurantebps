# PLAN-chocobites-theme.md

## Overview
Create a new theme `themes/chocobites` for a confectionery SaaS client. This theme will mirror the functionality of `themes/restaurante` but with a distinct visual identity (colors, fonts, imagery) suitable for a high-end chocolate/sweets shop.

## Project Type
**WEB** (Static Frontend Injection + Node.js Backend)

## Success Criteria
- [ ] `themes/chocobites/` directory exists with all required files.
- [ ] `index.html` reflects "ChocoBites" branding (Brown/Pink palette, confectionery text).
- [ ] `select-theme.js` successfully builds the theme to `public/`.
- [ ] Admin panel and Cart functionality remain intact.
- [ ] No regressions in `themes/restaurante` (isolation verified).

## Source Analysis (`themes/restaurante/`)

| File | Description | Customization Level |
|------|-------------|---------------------|
| `index.html` | Landing page (Hero, About, Highlights, Footer). | **HIGH** (Text, Colors, Images) |
| `menu.html` | Product listing page with category tabs. | **HIGH** (Header, Empty States) |
| `styles.css` | Custom CSS overrides for Tailwind. | **HIGH** (Color Variables) |
| `admin.html` | SPA for managing products/orders. | **LOW** (Branding only) |
| `js/app.js` | Main controller (Config, UI, API). | **MEDIUM** (Verify ID matches) |
| `js/cart.js` | Cart logic and persistence. | **NONE** (Shared logic) |
| `js/admin.js` | Admin panel logic. | **NONE** (Shared logic) |
| `gallery.html` | Image gallery. | **MEDIUM** (Placeholder images) |
| `contact.html` | Contact form. | **LOW** (Text updates) |
| `about.html` | About Us page. | **MEDIUM** (Text/Images) |

## Dependencies
- **UI <-> Logic**: `js/app.js` functionality depends heavily on specific DOM IDs in `index.html` and `menu.html` (e.g., `#hero-title`, `#nav-brand`, `#featured-dishes`). **DO NOT CHANGE THESE IDs** when styling.
- **Cart**: `menu.html` relies on `js/cart.js` exposing `window.cart`.
- **Config**: All pages rely on `js/app.js` fetching `/api/config`.

## Task Breakdown

### Phase 1: Setup
- [ ] Duplicate `themes/restaurante` to `themes/chocobites`. <!-- id: 1 -->
- [ ] Verify file structure integrity. <!-- id: 2 -->

### Phase 2: Branding Customization
- [ ] **Styles**: Update `styles.css` with confectionery color palette (Chocolate browns, creams, accent pinks). <!-- id: 3 -->
- [ ] **Home**: Edit `themes/chocobites/index.html` hero text and image placeholders. <!-- id: 4 -->
- [ ] **Menu**: Update `themes/chocobites/menu.html` headers. <!-- id: 5 -->

### Phase 3: Validation
- [ ] Run `THEME=chocobites npm run build` (via `select-theme.js`). <!-- id: 6 -->
- [ ] Manual visual check of `public/index.html`. <!-- id: 7 -->

## Phase X: Verification
- [ ] Build: `node scripts/select-theme.js` passes with `THEME=chocobites`.
- [ ] Lint: HTML/JS structure is valid.
- [ ] Cross-Theme: Confirm no changes leaked to `themes/restaurante`.
