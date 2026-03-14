#!/usr/bin/env node

/**
 * patch-html-perf.js — Performance patches for all theme HTML files
 *
 * Applies the following fixes to every HTML file in themes/:
 *   FIX 1: Remove cdn.tailwindcss.com + inline config → add /css/styles.css
 *   FIX 3: Remove duplicate Google Fonts preload (keep only stylesheet)
 *   FIX 4: Add defer to all script tags in the body
 *   FIX 5: Remove background-attachment: fixed
 *
 * Usage: node scripts/patch-html-perf.js
 */

const fs = require('fs');
const path = require('path');

const THEMES_DIR = path.join(__dirname, '..', 'themes');
const themes = fs.readdirSync(THEMES_DIR).filter(d =>
    fs.statSync(path.join(THEMES_DIR, d)).isDirectory()
);

let totalPatched = 0;

for (const theme of themes) {
    const themeDir = path.join(THEMES_DIR, theme);
    const htmlFiles = fs.readdirSync(themeDir).filter(f => f.endsWith('.html'));

    for (const file of htmlFiles) {
        const filePath = path.join(themeDir, file);
        let html = fs.readFileSync(filePath, 'utf-8');
        const original = html;
        const fixes = [];

        // --- FIX 1: Remove Tailwind CDN script ---
        if (html.includes('cdn.tailwindcss.com')) {
            html = html.replace(
                /\s*<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\s*/g,
                '\n    <link rel="stylesheet" href="/css/styles.css">\n'
            );
            fixes.push('FIX1:tailwind-cdn');
        }

        // --- FIX 1b: Remove inline tailwind.config block ---
        html = html.replace(
            /\s*<script>\s*tailwind\.config\s*=\s*\{[\s\S]*?\};\s*<\/script>/g,
            ''
        );
        if (html !== original && !fixes.includes('FIX1:tailwind-cdn')) {
            fixes.push('FIX1:inline-config');
        }

        // --- FIX 3: Remove duplicate Google Fonts preload (keep stylesheet) ---
        // Remove the <link rel="preload" as="style" href="...fonts.googleapis...">
        const preloadBefore = html;
        html = html.replace(
            /\s*<link rel="preload" as="style"\s*\n?\s*href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*">/g,
            ''
        );
        if (html !== preloadBefore) fixes.push('FIX3:font-preload');

        // --- FIX 4: Add defer to body scripts (non-deferred, non-inline) ---
        // Match <script src="..."></script> without defer, in the body
        const scriptBefore = html;
        html = html.replace(
            /<script src="(\/js\/[^"]+)"><\/script>/g,
            '<script defer src="$1"></script>'
        );
        if (html !== scriptBefore) fixes.push('FIX4:defer-scripts');

        // --- FIX 5: Remove background-attachment: fixed ---
        const bgBefore = html;
        html = html.replace(/\s*background-attachment:\s*fixed;\s*/g, '\n');
        if (html !== bgBefore) fixes.push('FIX5:bg-attachment');

        // --- Write if changed ---
        if (html !== original) {
            fs.writeFileSync(filePath, html, 'utf-8');
            console.log(`  ✅ ${theme}/${file} — ${fixes.join(', ')}`);
            totalPatched++;
        } else {
            console.log(`  ⏭️  ${theme}/${file} — no changes needed`);
        }
    }
}

console.log(`\n🎯 Total: ${totalPatched} files patched across ${themes.length} themes\n`);
