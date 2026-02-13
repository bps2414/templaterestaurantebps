# 🍽 Restaurant Template SaaS

**Sistema interno** para criação e entrega de sites profissionais personalizados para restaurantes.

> 📚 **Documentação completa:** [`docs/keep/README-repo.md`](docs/keep/README-repo.md)

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd server && npm install

# 2. Setup database
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Run migrations and seed
npm run prisma:migrate
npm run prisma:seed

# 4. Start development server
npm run dev
```

Server runs at `http://localhost:3000`

## 📖 Documentation

| Document | Purpose |
|---|---|
| [README-repo.md](docs/keep/README-repo.md) | Full project documentation |
| [GUIA_COMPLETO_DEPLOY.md](docs/keep/GUIA_COMPLETO_DEPLOY.md) | Production deployment guide |
| [Final Verdict](docs/keep/final_verdict.md) | Latest production readiness audit ✅ SAFE TO SELL |
| [Pricing Plans](docs/keep/PLANOS_COMERCIAIS.md) | Essential vs Professional tiers |

📁 All documentation: [`docs/`](docs/)

## 🎯 Features

✅ Admin panel with auth (JWT + CSRF)  
✅ Menu management (categories, dishes, images)  
✅ Gallery with CDN upload  
✅ WhatsApp integration  
✅ SaaS plans (Essential/Professional)  
✅ Production-ready security (rate limiting, magic bytes, helmet)

## 🛠 Tech Stack

- **Backend:** Express.js, TypeScript, Prisma, PostgreSQL
- **Frontend:** Vanilla JS, Tailwind CSS
- **Storage:** Cloudinary (images)
- **Auth:** JWT with rotation, CSRF protection

## 📊 Status

| Area | Score |
|---|---|
| Security | 8/10 |
| Technical | 8/10 |
| UX | 7/10 |
| **Production Ready** | ✅ **YES** |

---

**License:** Internal use only  
**Last updated:** 2026-02-13
