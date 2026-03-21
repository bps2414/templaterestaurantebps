# Technology Stack

## Backend
- **Language:** TypeScript (Node.js)
- **Framework:** Express
- **Database ORM:** Prisma
- **Database:** PostgreSQL (Neon)
- **Validation:** Zod

## Frontend
- **Themes Architecture:** Static Injection
- **Styling:** Tailwind CSS

## External Services & Libraries
- **Image Hosting:** Cloudinary
- **Authentication:** JSON Web Tokens (JWT)

## Deployment & Infrastructure
- **Demo Hosting:** Vercel
- **Production Hosting:** VPS (Virtual Private Server) with Coolify
- **Required Deploy Environment Variables:**
  - `DATABASE_URL` (Neon connection string)
  - `JWT_SECRET` (For secure authentication)
  - `CORS_ORIGINS` & `APP_URL` (Domain routing)
  - `THEME` (To select active template)
  - Cloudinary credentials