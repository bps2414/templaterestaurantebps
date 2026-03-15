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

// Starter/lite themes use shared JS from themes/_shared/js/
const LITE_THEMES = ['restaurant-lite', 'burger-lite', 'pizza-lite', 'acai'];
const isLiteTheme = LITE_THEMES.includes(THEME);
const SHARED_JS = path.join(ROOT, 'themes', '_shared', 'js');

console.log(`\n🎨 Select Theme: "${THEME}"`);
console.log(`   Source:  ${SRC}`);
console.log(`   Dest:    ${DEST}\n`);

// --- Validate theme exists ---
if (!fs.existsSync(SRC)) {
  const available = fs.readdirSync(path.join(ROOT, 'themes')).filter((d) =>
    d !== '_shared' && fs.statSync(path.join(ROOT, 'themes', d)).isDirectory()
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

console.log(`✅ Tema "${THEME}" aplicado com sucesso! (${fileCount} arquivos copiados)`);

// --- Copy shared JS for lite themes ---
if (isLiteTheme) {
  if (fs.existsSync(SHARED_JS)) {
    const jsDestDir = path.join(DEST, 'js');
    console.log(`📦 Copiando JS compartilhado (_shared/js/) para tema lite...`);
    const jsCount = copyDir(SHARED_JS, jsDestDir);
    console.log(`✅ ${jsCount} arquivos JS compartilhados copiados`);
  } else {
    console.error('❌ themes/_shared/js/ não encontrado!');
    process.exit(1);
  }
}

// --- Compile Tailwind CSS ---
const inputCss = path.join(SRC, 'input.css');
if (fs.existsSync(inputCss)) {
  const outDir = path.join(DEST, 'css');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, 'styles.css');
  console.log(`\n🎨 Compilando Tailwind CSS...`);

  const { execSync } = require('child_process');
  try {
    execSync(
      `npx @tailwindcss/cli -i "${inputCss}" -o "${outFile}" --minify`,
      { cwd: ROOT, stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } }
    );
    console.log(`✅ CSS compilado → ${outFile}\n`);
  } catch (err) {
    console.error('❌ Tailwind CSS build falhou:', err.message);
    process.exit(1);
  }
} else {
  console.log(`⚠️  Sem input.css no tema "${THEME}" — CSS não compilado.`);
}

// --- Minify JS files ---
const jsDir = path.join(DEST, 'js');
if (fs.existsSync(jsDir)) {
  const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  if (jsFiles.length > 0) {
    console.log(`📦 Minificando ${jsFiles.length} arquivos JS...`);
    const { execSync } = require('child_process');
    let minified = 0;
    for (const jsFile of jsFiles) {
      const jsPath = path.join(jsDir, jsFile);
      try {
        execSync(`npx terser "${jsPath}" -o "${jsPath}" -c -m`, {
          cwd: ROOT, stdio: 'pipe'
        });
        minified++;
      } catch (err) {
        console.error(`  ⚠️  Falha ao minificar ${jsFile}: ${err.message}`);
      }
    }
    console.log(`✅ ${minified}/${jsFiles.length} JS files minificados\n`);
  }
}
