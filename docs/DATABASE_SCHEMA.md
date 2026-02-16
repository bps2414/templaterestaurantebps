# 🗄️ Database Schema Documentation

## 📌 Overview
**Database:** PostgreSQL
**ORM:** Prisma
**Hosting:** Neon Tech
**Connection:** pooled (production) / direct (migrations)

This document outlines the data models used in the Restaurant SaaS.

## 🧩 Models

### 1. `AdminUser` (Table: `admin_users`)
Stores the SaaS owner (restaurant manager).
- **id**: UUID
- **email**: Unique login email.
- **passwordHash**: BCrypt hashed password.
- **role**: `ADMIN` or `EDITOR`.
- **tokenVersion**: Integer for invalidating sessions (security).

### 2. `Session` (Table: `sessions`)
Manages active logins (JWT Refresh Tokens).
- **refreshTokenHash**: Securely stored hash of the refresh token.
- **expiresAt**: Token expiration.
- **userId**: Relates to `AdminUser`.
- **Note**: If a refresh token is stolen, we can revoke it by deleting this row or incrementing `AdminUser.tokenVersion`.

### 3. `Category` (Table: `categories`)
Menu categories (e.g., "Pizzas", "Bebidas", "Entradas").
- **name**: Display name.
- **slug**: URL-friendly name.
- **sortOrder**: For custom ordering in the UI.
- **active**: Visibility toggle.
- **image**: Optional category cover image.

### 4. `Dish` (Table: `dishes`)
The actual menu items.
- **name**: Name of the dish.
- **slug**: URL-friendly identifier.
- **price**: Integer (in cents, e.g., 1000 = R$ 10,00).
- **image**: URL to Cloudinary image.
- **featured**: Boolean to feature on homepage.
- **categoryId**: Relation to `Category`.

### 5. `SiteConfig` (Table: `site_config`)
Key-Value store for dynamic site content.
- **key**: Setting name (e.g., `hero_title`, `whatsapp_number`, `colors_primary`).
- **value**: Setting value (String).
- **Usage**: Frontend fetches these to customize the look without code changes.

### 6. `GalleryImage` (Table: `gallery_images`)
Images for the dedicated gallery page.
- **src**: Cloudinary URL.
- **alt**: Accessibility text.
- **sortOrder**: Custom ordering.

### 7. `TemplatePurchase` (Table: `template_purchases`)
Records of template sales (if selling this SaaS).
- **stripeSessionId**: Link to payment provider.
- **status**: `pending`, `paid`.

## 🔗 Relationships
- **One-to-Many**: `Category` -> `Dish` (One category has many dishes).
- **One-to-Many**: `AdminUser` -> `Session` (One admin has many sessions).

## 🛡️ Enums
- **Role**: `ADMIN`, `EDITOR`.
