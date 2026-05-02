# 🗺️ Project Manifest & Architecture Map

## 📍 Overview
**Project Name:** Landpage (Restaurant Template SaaS)
**Type:** Full-stack Web Application (SaaS)
**Stack:**
- **Frontend:** Vanilla JS, Tailwind CSS, HTML5 (Multi-template architecture)
- **Backend:** Node.js (Express), TypeScript
- **Database:** PostgreSQL (Neon), Prisma ORM
- **Infrastructure:** Render (Web Service), Cloudinary (Images)

## 📂 Directory Structure

### `public/` (Frontend)
The public-facing website. Contains static assets and client-side logic.
- **`index.html`**: Main landing page (Restaurant Template).
- **`admin.html`**: Admin dashboard for owners.
- **`menu.html`**: Menu listing page.
- **`js/`**: Client-side logic.
  - `app.js`: Main application logic.
  - `cart.js`: Shopping cart management.
  - `admin.js`: Admin panel logic (fetch data, update UI).
  - `sync-safe.ps1`: (Note: This is a script, likely misplaced in description, usually in scripts/ folder).

### `server/` (Backend)
The API logic, database connection, and serving static files in production.
- **`src/app.ts`**: Express application setup, middleware (CORS, Helmet, Rate Limit).
- **`src/routes/`**: API endpoints (dishes, categories, admin, auth).
- **`prisma/schema.prisma`**: Database schema definition.

### `scripts/` (Automation)
Powershell scripts for maintenance and deployment.
- **`sync-safe.ps1`**: **CRITICAL**. Synchronizes changes from `main` to `template-b/c` while protecting template-specific assets.
- **`preflight.ps1`**: Checks project health before commits/deploy (linting, types, tests).

## 🧩 Key Architecture Concepts

### 1. Multi-Template System
The project supports multiple visual templates ("Restaurante" vs "Hamburgueria") using Git Branches.
- **`main`**: The core "Restaurante" template. Source of truth for logical code.
- **`template-b`**: "Hamburgueria". Inherits logic from `main` but assumes different CSS/colors/images.
- **`template-c`**: Future templates.

### 2. Asset Protection Rule
When syncing code from `main` to `template-b`, certain files MUST NEVER be overwritten:
- `public/index.html` (contains template-specific text/layout).
- `public/js/app.js` (may contain template-specific hardcoded strings if any).
- `styles.css` (template theme).

### 3. SaaS & Tenant Isolation
Current architecture is "Single Repo, Multiple Deployments".
- Each client gets a separate Render Service + Neon Database Project.
- The codebase is identical; usage is defined by Environment Variables (`SEED_TYPE`, `DATABASE_URL`).

## 🛡️ Security Features
- **CSRF Protection**: Critical interaction with `csrf-token` endpoint.
- **Rate Limiting**: Applied to sensitive routes (login, upload).
- **Magic Bytes Check**: Verifies image uploads are real images, not renamed executables.

## 🔄 Core Workflows
1. **New Client Setup**: Run `deploy_client` script/instruction.
2. **Syncing Updates**: Dev on `main` -> Run `scripts/sync-safe.ps1` -> Merge to `template-b`.
3. **Database Updates**: Modify `schema.prisma` -> `npx prisma migrate dev`.
