#!/usr/bin/env node

/**
 * select-theme.js — Static Build Injection
 *
 * Reads THEME env var and copies the matching theme folder
 * from themes/{THEME}/ into public/.
 *
 * Usage:
 *   THEME=hamburgueria node scripts/select-theme.js
 *
 * If THEME is not set, defaults to 'restaurante'.
 * If the theme folder does not exist, exits with code 1.
 */

const fs = require('fs');
const path = require('path');

const THEME = process.env.THEME || 'restaurante';
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'themes', THEME);
const DEST = path.join(ROOT, 'public');

console.log(`\n🎨 Select Theme: "${THEME}"`);
console.log(`   Source:  ${SRC}`);
console.log(`   Dest:    ${DEST}\n`);

// --- Validate theme exists ---
if (!fs.existsSync(SRC)) {
  const available = fs.readdirSync(path.join(ROOT, 'themes')).filter((d) =>
    fs.statSync(path.join(ROOT, 'themes', d)).isDirectory()
  );
  console.error(`❌ Tema "${THEME}" não encontrado em themes/`);
  console.error(`   Temas disponíveis: ${available.join(', ')}`);
  process.exit(1);
}

// --- Clean public/ (preserve .gitkeep) ---
function cleanDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return;
  }
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    if (entry === '.gitkeep') continue;
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
  }
}

// --- Copy recursively ---
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src);
  let count = 0;
  for (const entry of entries) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

// --- Execute ---
console.log('🧹 Limpando public/...');
cleanDir(DEST);

console.log(`📦 Copiando tema "${THEME}"...`);
const fileCount = copyDir(SRC, DEST);

console.log(`\n✅ Tema "${THEME}" aplicado com sucesso! (${fileCount} arquivos copiados)\n`);
