# NotebookLM Source: Project Architecture & Rules

> **Purpose:** This document serves as a comprehensive source of truth for the project's architecture, rules, and workflows. It is intended to be ingested by NotebookLM to provide context for future development tasks.

---

## 1. Architecture Overview: Single Branch System

The project has transitioned from a multi-branch strategy (e.g., `main`, `template-b`) to a **Single Branch Architecture** operating primarily on `main`.

### Key Components

-   **Source of Truth (`themes/`)**:
    -   The `themes/` directory contains the definitive version of frontend code for each theme.
    -   Examples:
        -   `themes/restaurante/`: Default restaurant theme.
        -   `themes/hamburgueria/`: Hamburger theme.
        -   `themes/pizzaria/`: Pizzeria theme.
        -   `themes/confeitaria/`: Confectionery theme.
    -   **Rule**: ALL frontend edits (HTML, CSS, JS) must be made here.

-   **Volatile Output (`public/`)**:
    -   The `public/` directory is **generated automatically** and acts as the build output.
    -   **Rule**: NEVER edit files in `public/` directly for permanent changes. They will be overwritten by the build script.

-   **Build Script (`scripts/select-theme.js`)**:
    -   Responsible for injecting the selected theme from `themes/{theme}` into `public/`.
    -   Usage: `THEME=hamburgueria npm run dev` (or similar build command).

---

## 2. Database Seeding: "Seed with Image"

The seeding strategy has been enhanced to support theme-specific data and images.

### Seed Router (`seed.ts`)
-   Acts as the entry point for seeding.
-   Reads the `SEED_TYPE` environment variable to determine which specific seed file to execute.
-   Supported types: `restaurante`, `hamburgueria`, `pizzaria`, `confeitaria`.

### Theme-Specific Seeds
-   Files: `seed-hamburgueria.ts`, `seed-pizzaria.ts`, etc.
-   **Feature**: Each seed file includes:
    -   **Categories**: Theme-appropriate categories (e.g., "Hambúrgueres", "Pizzas Tradicionais").
    -   **Dishes**: Specific dishes with:
        -   Name, description, price.
        -   **Matches Theme**: E.g., burgers for hamburgueria, pizzas for pizzaria.
        -   **Images**: High-quality Unsplash URLs relevant to the specific dish.

### Image Strategy
-   **Nullable Field**: `Dish` model has a nullable `image` field.
-   **Source**: Currently using Unsplash URLs for development/demo purposes.
-   **Future**: Support for local usage via `public/uploads`.

---

## 3. Critical Rules & Protocols

### Global User Rules
1.  **Single Branch**: Always work on `main`.
2.  **Source of Truth**: Always edit `themes/{theme}`, never `public/`.
3.  **Language**: All responses and documentation in **Portuguese (Brazil)** unless specified otherwise.

### Cross-Theme Fix Protocol
-   **Problem**: Changes to shared logic or structure often need to be replicated across all themes.
-   **Solution**:
    -   **Structural/SEO/A11y**: Must be applied to ALL themes (`themes/restaurante`, `themes/hamburgueria`, etc.).
    -   **Design/Content**: Keep specific to the theme (e.g., brand colors, hero images).
    -   **Process**:
        1.  Identify the fix.
        2.  Apply to current theme.
        3.  Immediately replicate to other themes in `themes/`.

### Deprecated Workflows
-   **Sync Scripts (`sync-admin.ps1`, `sync-core-js.ps1`)**: These were used for the multi-branch system and are largely **deprecated** in favor of the single-branch + themes folder structure.
-   **Template Branches**: Using `git checkout template-b` is **obsolete**.

---

## 4. Active Memories

### `cross-theme-html-fixes.md`
> **Reminder**: When fixing a bug in one theme's HTML (e.g., missing ID, broken script tag), check if the same bug exists in other themes and fix it there too.

### `GEMINI.md`
> **Protocol**: Always read Agent and Skill definitions before starting work. Use the `task_boundary` tool to manage complex tasks.

---

## 5. Environment Variables

-   `PLAN`: Subscription plan (e.g., `premium`, `enterprise`).
-   `SEED_TYPE`: Controls which seed data to load (`restaurante`, `hamburgueria`, etc.).
-   `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`: Default admin credentials.
