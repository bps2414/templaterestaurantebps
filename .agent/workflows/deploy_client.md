---
description: Automates the full deployment process for a new client (Neon + Seed + Render)
---

1. **Collect Client Details**:
   - Ask the user for: `CLIENT_NAME` (ex: lampiaoburguer), `BUSINESS_TYPE` (restaurante/hamburgueria/pizzaria), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `PLAN` (essential/professional).

2. **Create Neon Project**:
   - Use `mcp-server-neon.create_project` with `name: [CLIENT_NAME]`, `region_id: aws-us-west-2` (Oregon - Same as Render).
   - **Save** the `connection_string` (for Pooled connection) and the Direct connection string (check Neon output or construct it).

3. **Seed Database (Local execution)**:
   - Use `run_command` in `f:\VSCode\Landpage\server`.
   - Run `npx prisma migrate deploy` locally using the **DIRECT** connection string as `DATABASE_URL`.
   - Run `npx prisma db seed` locally, setting environment variables:
     - `DATABASE_URL`: [POOLED connection string]
     - `DIRECT_URL`: [DIRECT connection string]
     - `SEED_ADMIN_EMAIL`: [ADMIN_EMAIL]
     - `SEED_ADMIN_PASSWORD`: [ADMIN_PASSWORD]
     - `SEED_TYPE`: [BUSINESS_TYPE]
     - `PLAN`: [PLAN]

4. **Deploy to Render**:
   - Determine **Branch**:
     - If `BUSINESS_TYPE` is `restaurante` -> use `main`
     - If `BUSINESS_TYPE` is `hamburgueria` -> use `template-b`
     - (`pizzaria` is currently unused/legacy)
   - Use `render.create_service` with:
     - `type`: "web_service"
     - `name`: `[CLIENT_NAME]`
     - `repo`: `https://github.com/bps2414/templaterestaurantebps`
     - `branch`: [Selected Branch]
     - `rootDir`: `server`
     - `plan`: `free` (or starter)
     - `region`: `oregon` (US West - Low latency with Neon)
     - `buildCommand`: `npm ci --include=dev && npx prisma generate && npm run build`
     - `startCommand`: `sh scripts/start.sh`
     - `envVars`:
       - `DATABASE_URL`: [POOLED connection string from Step 2]
       - `Direct_URL`: [DIRECT connection string from Step 2]
       - `NODE_ENV`: "production"
       - `JWT_SECRET`: [Run: `node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"`]
       - `CLOUDINARY_CLOUD_NAME`: "dmebhvwpo"
       - `CLOUDINARY_API_KEY`: "448539967934699"
       - `CLOUDINARY_API_SECRET`: "1XICB1VlrYJGz2Wh-EOraAOsehM"
       - `CLOUDINARY_FOLDER_PREFIX`: `[CLIENT_NAME]`
       - `APP_URL`: `https://[CLIENT_NAME].onrender.com`
       - `CORS_ORIGINS`: `https://[CLIENT_NAME].onrender.com`

5. **Verify**:
   - Notify user with the App URL and verification steps.
