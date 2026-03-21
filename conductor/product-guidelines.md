# Product Guidelines

## 1. Design & UX Principles
- **Mobile-First Approach:** Since end-users (restaurant customers) will primarily view the digital menus on their phones via WhatsApp links, all templates must be impeccably optimized for mobile devices.
- **Simplicity and Clarity:** The admin dashboard must be intuitive for restaurant owners with varying levels of technical expertise. Avoid cluttered interfaces. Use clear typography and spacing.
- **Fast Loading Speeds:** Optimized assets and minimal overhead are crucial to reduce bounce rates for online menus.

## 2. Branding & Content Style
- **Professional but Approachable:** The tone in the admin dashboard and template placeholders should be professional, welcoming, and encouraging.
- **Customizability:** The themes should maintain a strong structural baseline while allowing significant brand color and typography alterations by the tenant.

## 3. Engineering Guidelines
- **Zero-Downtime Theme Switching:** Code must be structured so that selecting or updating themes via static injection (`themes/{tema}/`) is instantaneous.
- **Reusability & DRY:** Shared UI components across themes should be modularized where possible, minimizing duplicate HTML/CSS.
- **Resilience:** The backend must handle missing fields gracefully and avoid crashing, ensuring maximum uptime for restaurant sites.