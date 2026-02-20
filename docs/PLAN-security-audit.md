# Security Audit Plan

## Overview
A comprehensive, end-to-end security audit of the Landpage SaaS project before releasing it to a client. The objective is to identify, mitigate, and patch any vulnerabilities, data leaks, logic flaws, and misconfigurations (following the OWASP Top 10) to make the application provably secure for production use and sale.

## Project Type
**WEB** (Node.js/Express API Backend + Prisma ORM + Vanilla HTML/JS Static Injection Frontend)

## Success Criteria
- Zero critical or high vulnerabilities found from automated scanners and manual pentesting.
- Prevention against all major web attacks (XSS, CSRF, SQLi via arbitrary inputs) properly validated.
- Secure image uploads enforced (e.g. Magic Bytes verification, Cloudinary settings).
- Infrastructure Hardening applied (Strict CORS, Content-Security-Policy header, Helmet.js).
- Dependabot/NPM audit runs perfectly clean.

## Tech Stack
- **Backend:** Node.js, Express
- **Database:** Prisma ORM, PostgreSQL (Neon)
- **Frontend:** Vanilla HTML/JS/CSS (Static Injection, `themes/` to `public/`)
- **Storage:** Cloudinary

## File Structure
- `server/` - Backend API, Auth middleware, Database interactions.
- `themes/` - Frontend HTML/JS source code (where XSS checks must apply).
- `scripts/` - Automation and build processes.

## Task Breakdown

### Task 1: Supply Chain & Dependency Security Update
- **Agent:** `security-auditor`
- **Skill:** `vulnerability-scanner`
- **Priority:** P0
- **INPUT:** `package.json` (server directory & root).
- **OUTPUT:** Updated `package-lock.json`, resolution of known CVEs.
- **VERIFY:** `npm run audit` or `dependency_analyzer.py` returns 0 High/Critical vulnerabilities.

### Task 2: Infrastructure & HTTP Header Hardening
- **Agent:** `security-auditor`
- **Skill:** `server-management`
- **Priority:** P1
- **INPUT:** Application entry point (`server/src/app.ts`).
- **OUTPUT:** Configured Helmet middlewares, enforced HSTS, secure Cookie flags, and strict CORS configuration.
- **VERIFY:** Tools like `securityheaders.com` (simulated locally) score A+, X-Powered-By is hidden, and CORS rejects arbitrary origins.

### Task 3: API Security & Abuse Prevention (Rate Limiting & CSRF)
- **Agent:** `backend-specialist`
- **Skill:** `api-patterns`
- **Priority:** P0
- **INPUT:** `server/src/routes/` and middleware.
- **OUTPUT:** Global rate limiting, brute-force protection on auth points, and CSRF token infrastructure for mutating endpoints.
- **VERIFY:** Attempting to brute-force a login endpoint returns a `429 Too Many Requests`.

### Task 4: Secure File Upload Verification
- **Agent:** `backend-specialist`
- **Skill:** `red-team-tactics`
- **Priority:** P1
- **INPUT:** Image upload handlers (typically inside controllers/routes matching Cloudinary).
- **OUTPUT:** Magic Bytes validation prior to upload (instead of relying merely on `.ext` checks).
- **VERIFY:** Attempting to upload a `malicious.php` renamed to `image.jpg` is actively rejected.

### Task 5: Frontend Vulnerability Scan (XSS & DOM Injection)
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P2
- **INPUT:** `themes/` HTML forms and dynamic JavaScript rendering (`app.js`, `cart.js` etc.).
- **OUTPUT:** Validated inputs, `textContent` preferred over `innerHTML`, DOMPurify applied where HTML string injection is strictly necessary.
- **VERIFY:** Injecting payload `<img src=x onerror=alert(1)>` into the search or cart does not execute.

### Task 6: Authentication & Authorization Rules Checking
- **Agent:** `security-auditor`
- **Skill:** `red-team-tactics`
- **Priority:** P0
- **INPUT:** Admin routes & API guard middleware.
- **OUTPUT:** Ensuring no Broken Access Control (IDOR) exists on endpoints.
- **VERIFY:** Direct curl requests to `/api/admin/*` endpoints without a valid token result in a solid `401 Unauthorized` or `403 Forbidden`.

## ✅ Phase X: Verification (Pre-Sale Clearance)
- [ ] Run `npm run lint` & `npx tsc --noEmit` in server.
- [ ] Run `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .` successfully.
- [ ] Execute `python .agent/skills/vulnerability-scanner/scripts/dependency_analyzer.py .` and confirm it passes.
- [ ] Check Socratic Gate rule adherence.
- [ ] Verify magic bytes implementation on arbitrary file submissions.
