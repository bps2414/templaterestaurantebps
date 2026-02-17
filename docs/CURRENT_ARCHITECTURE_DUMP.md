# Architecture Dump: Single Branch & Static Injection
**Date:** 2026-02-16
**Version:** 2.0.0 (Migration to Single Branch)

This document provides a technical overview of the current "Single Branch" architecture, replacing the previous "Template Branch" strategy. It is intended for ingestion into NotebookLM to update the project knowledge base.

---

## 1. Core Concept: Single Branch Architecture

The project now operates on a **single `main` branch**.
*   **Source of Truth:** The `themes/{theme_name}` directory.
*   **Build Artifact:** The `public/` directory (Auto-generated).
*   **Mechanism:** "Static Injection". The build script wipes `public/` and copies the selected `themes/{theme}` into it.
*   **Theme Selection:** Controlled via `THEME` environment variable.

### 🚫 Rules (Critical)
1.  **NEVER edit `public/` directly.** Changes will be lost on the next build.
2.  **ALWAYS edit `themes/{theme}/`.**
3.  **Cross-Theme Fixes:** If fixing a bug in `themes/restaurante/index.html`, YOU MUST verify and apply it to `themes/hamburgueria/index.html` as well.

---

## 2. File Structure

### Themes Directory (Source)
Managed in `themes/`. Each folder is a standalone frontend template.
```text
themes/
├── hamburgueria/
│   ├── index.html
│   ├── menu.html
│   ├── ... (other pages)
│   └── js/
└── restaurante/
    ├── index.html  <-- Edit this for 'Restaurante' theme
    ├── menu.html
    └── js/
```

### Public Directory (Target)
Populated at build time.
```text
public/
├── index.html      <-- DO NOT EDIT (Generated)
├── js/
│   └── app.js      <-- DO NOT EDIT (Generated)
└── ...
```

---

## 3. Build Infrastructure

### `scripts/select-theme.js`
This script performs the "Static Injection". It cleans `public/` and copies `themes/{THEME}/`.

```javascript
// scripts/select-theme.js
const fs = require('fs');
const path = require('path');

const THEME = process.env.THEME || 'restaurante';
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'themes', THEME);
const DEST = path.join(ROOT, 'public');

// ... (Verification logic)

// 1. Clean public/
function cleanDir(dir) {
  // ... (removes all files except .gitkeep)
}

// 2. Copy Source -> Dest
function copyDir(src, dest) {
  // ... (recursive copy)
}

// Execution
cleanDir(DEST);
copyDir(SRC, DEST);
```

### `server/package.json` (Build Scripts)
The `build` and `start` scripts orchestrate the injection.

```json
{
  "scripts": {
    "select-theme": "node ../scripts/select-theme.js",
    "build": "node ../scripts/select-theme.js && tsc", 
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "dev:confeitaria": "cross-env THEME=confeitaria node ../scripts/select-theme.js && ...",
    "seed:confeitaria": "cross-env SEED_TYPE=confeitaria ts-node prisma/seed.ts"
  }
}
```

### `server/src/app.ts` (Static Serving)
Express serves the `public/` directory as static assets.

```typescript
// server/src/app.ts
// ...
// --- Serve static frontend ---
app.use(express.static(path.join(__dirname, '../../public'), {
    index: false,
    dotfiles: 'deny',
    maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
}));

// --- Serve pages (SPA/MPA routing) ---
const pages = ['index', 'menu', 'gallery', 'about', 'contact', 'privacy', 'admin'];
pages.forEach(page => {
    const route = page === 'index' ? '/' : `/${page}`;
    app.get(route, (_req: Request, res: Response) => {
        // ...
        res.sendFile(path.join(publicDir, `${page}.html`));
    });
});
```

---

## 4. Frontend-Backend Integration

The frontend assumes it is dynamic. It fetches configuration from `/api/config` to hydration.

### `server/src/routes/config.ts` (API)
Returns key-value pairs (`siteConfig`) allowing the frontend to adapt (titles, phones, colors).

```typescript
// server/src/routes/config.ts
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const configs = await prisma.siteConfig.findMany();
        const configMap: Record<string, string> = {};
        configs.forEach((c) => {
             // ... filter internal keys
             configMap[c.key] = c.value;
        });
        res.json({ success: true, data: configMap });
    } catch (error) { next(error); }
});
```

### `public/js/app.js` (Frontend Hydration)
Hydrates the HTML with data from the API.

```javascript
// public/js/app.js (Source: themes/{theme}/js/app.js)

async function loadConfig() {
    try {
        const data = await api(`/config?_=${Date.now()}`);
        if (data) {
            siteConfig = validateConfig(data);
            applyConfig(); // Updates DOM: document.title, meta tags, hero text, etc.
        }
    } catch (e) {
        // Fallback or error handling
    } finally {
        document.body.classList.add('config-loaded'); // Triggers FOUC prevention fade-in
    }
}

function applyConfig() {
    const c = siteConfig;
    setText('nav-brand', c.restaurant_name);
    setHeroTitle('hero-title', c.hero_title);
    // ... Applies WhatsApp, Social Links, Colors, etc.
}
```

---

## 5. Database Seeding Strategy

Seeding is controlled by the `SEED_TYPE` environment variable, enabling different datasets (Restaurante, Pizzaria, Hamburgueria) on the same schema.

### `server/prisma/seed.ts`
Routes execution to the correct seeder.

```typescript
// server/prisma/seed.ts
async function main() {
    const seedType = (process.env.SEED_TYPE || 'restaurante').toLowerCase().trim();

    switch (seedType) {
        case 'hamburgueria':
            await seedHamburgueria();
            break;
        case 'pizzaria':
            await seedPizzaria();
            break;
        case 'confeitaria':
            await seedConfeitaria();
            break;
        case 'restaurante':
        default:
            await seedRestaurante(); // Logic for default restaurant
            break;
    }
}
```
