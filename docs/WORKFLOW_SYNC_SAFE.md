# 🔄 Workflow: Safe Synchronization (Legacy vs New)

## 📌 Context
The project maintains multiple branches (`main`, `template-b`, `template-c`) representing different visual templates but sharing the same backend/logic core.
Synchronizing fixes from `main` to templates manually is error-prone and can overwrite unique designs.

## 🛠 The Tool: `scripts/sync-safe.ps1`
This is the **GOLD STANDARD** script for keeping templates updated.

### Key Features
1.  **Selective Merging**: It cherry-picks changes file-by-file.
2.  **Protection List**: It compares against a strict list of allowed/blocked files.
    - **BLOCKED (Never Sync):** `public/index.html`, `styles.css`, `public/images/*`, `public/js/app.js` (if designated as template-specific).
    - **ALLOWED (Always Sync):** `server/*`, `public/admin.html`, `public/js/utils/*`, `package.json`.
3.  **Conflict Resolution**: It attempts auto-merge but pauses for manual resolution if git cannot handle it.
4.  **Dry Run Mode**: `.\scripts\sync-safe.ps1 -DryRun` shows exactly what *would* happen without touching files.

## 🚀 How to Run a Sync

### Step 1: Fix bug in Main
Developer fixes a bug in `server/src/routes/auth.ts` on the `main` branch.
Commit and push: `git commit -m "fix: auth bug" && git push origin main`.

### Step 2: Switch to Target Branch
`git checkout template-b`

### Step 3: Run Safety Check (Dry Run)
`.\scripts\sync-safe.ps1 -DryRun`

**Review Output:**
- Look for red flags.
- Ensure `public/index.html` is **NOT** listed as modified (unless you explicitly intended to change structure).

### Step 4: Execute Sync
`.\scripts\sync-safe.ps1`

### Step 5: Verify & Push
Run `npm run dev` to verify the application starts.
`git push origin template-b`

## ⚠️ Common Pitfalls
- **Overwriting Layouts**: Accidental sync of `index.html` reverts the "Hamburgueria" layout back to "Restaurante". The script prevents this, but manual merges can bypass it.
- **CSS Conflicts**: `styles.css` is usually unique. If you add a NEW global utility class in `main`, you must manually add it to `template-b`'s CSS if it's needed, or use a shared `base.css` file (if architected).

## 📊 Troubleshooting
If the script fails:
1. Check `git status` for a muddy working directory.
2. Abort: `git merge --abort`.
3. Manually cherry-pick the specific commit: `git cherry-pick <commit-hash>`.
