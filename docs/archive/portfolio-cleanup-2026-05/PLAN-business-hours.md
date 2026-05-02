# Plan: Business Hours & Cart Lock functionality

## Overview
Implement a feature to disable the "Order Now" (Pedir agora) and "Cart" (Carrinho) buttons when the restaurant is closed. The business hours will be configurable by the admin in the control panel. Additionally, a banner message will be displayed at the top of the website indicating the establishment is closed.

## Project Type
WEB

## Success Criteria
- [ ] Admin panel has a new UI section to configure business hours (e.g., standard open/close times, marked days) and a manual override toggle (e.g., "Force Closed").
- [ ] Backend API securely stores and serves these new configuration keys (`business_hours_schedule`, `store_manual_status`).
- [ ] Frontend apps (`app.js` across themes) evaluate the current time against the configured schedule.
- [ ] If the store is closed, cart and order buttons are visually disabled and unclickable, and a "Fechado" banner appears.
- [ ] Changes are correctly applied to the source of truth (`themes/` folder) for all themes (`restaurante`, `hamburgueria`, `pizzaria`, `confeitaria`).

## Constraints & Rules
- All HTML edits must be synced across all themes as per project rules.
- The `public` folder must NOT be edited directly; edits must be made in `themes/{tema}`.

## Task Breakdown

### Task 1: Backend Configuration Keys (backend-specialist)
- **INPUT**: Add new keys (`business_hours_schedule`, `store_manual_status`) to the `ALLOWED_KEYS` whitelist in `server/src/routes/config.ts`.
- **OUTPUT**: Backend accepts and serves the new settings.
- **VERIFY**: Send a PUT request with the new keys and verify they are saved and returned in the GET response.

### Task 2: Admin Panel UI (frontend-specialist)
- **INPUT**: Modify `themes/{tema}/admin.html` (for all themes) to add a "Horário de Funcionamento" section inside the Config tab.
  - Implement a simple weekly schedule UI (e.g., open time, close time, and active days) and a manual override ("Forçar Loja Fechada").
- **OUTPUT**: Admin users can configure the store hours intuitively.
- **VERIFY**: Check the admin panel visually, interact with the new inputs, and confirm clicking "Salvar Tudo" persists the new configuration to the backend.

### Task 3: Store Status Logic & Cart Lockdown (frontend-specialist)
- **INPUT**: In `themes/{tema}/js/app.js` (and `app_temp_b.js`), add a utility function `checkStoreStatus()` that:
  - Parses the `business_hours_schedule` JSON from the site config.
  - Compares it with `new Date()` (client-side time).
  - Returns `isOpen: boolean`.
- **OUTPUT**: The site knows whether it should accept orders.
- **VERIFY**: Hardcode different times in the console to test open/closed logic robustly.

### Task 4: Disable Buttons & Show Closed Banner (frontend-specialist)
- **INPUT**: Update the UI based on `checkStoreStatus()`. 
  - If `isOpen === false`:
    - Inject a banner at the top (`<div id="closed-banner">Loja Fechada no momento</div>`).
    - Select all buttons that open the cart or add items, add `disabled` attribute, change their text/style to indicate closure.
    - Block the `addToCart()` function execution.
- **OUTPUT**: User is completely prevented from ordering when closed.
- **VERIFY**: Visit the site when closed, try to click the cart or "Pedir agora", ensure no items can be added and the banner is visible.

## Phase X: Verification
- [ ] `npm run lint && npx tsc --noEmit`
- [ ] Run `python .agent/scripts/checklist.py .` to ensure nothing is broken.
- [ ] Deploy locally and verify the hours logic with manual system clock changes.
