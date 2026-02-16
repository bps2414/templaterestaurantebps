# Task Checklist: Static Build Injection & Theme Images

## Phase 1: Static Build Injection Migration

- [x] Restructure project folders for themes.
- [x] Create `scripts/select-theme.js` script.
- [x] Update `server/package.json` build/preflight scripts.
- [x] Establish cross-theme HTML fix rule.
- [x] Document migration in `walkthrough.md`.

## Phase 2: Seed Theme-Specific Images

- [x] Update `server/prisma/seed.ts` (Restaurante) with Unsplash images.
- [x] Update `server/prisma/seed-hamburgueria.ts` with Unsplash images.
- [x] Update `server/prisma/seed-pizzaria.ts` with Unsplash images.
- [x] Verify API returns images (manual test).

## Phase 3: Local Testing & Verification

- [x] Configure local Docker DB (server/.env updated).
- [x] Patch `preflight.ps1` to respect .env DATABASE_URL.
- [x] Test Hamburgueria theme: seed, run server, verify images.
- [x] Test Restaurante theme: seed, run server, verify images.
- [-] Test Pizzaria theme (Skipped per user request).
- [x] Verify API endpoints for dish images (Done).
- [x] Debug & Fix corrupted theme files (Mojibake/Git conflicts).
- [ ] Commit and push changes (Pending user approval).
