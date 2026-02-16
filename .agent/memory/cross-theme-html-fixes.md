---
trigger: when_editing_html_in_themes
priority: P1
---

# Cross-Theme HTML Fix Protocol

## Rule
When editing ANY HTML file in `themes/[theme_name]/`, you MUST apply the SAME fix to ALL other themes in the `themes/` folder to maintain consistency.

## Workflow

1. **Identify the Fix:**
   - If fixing a bug (e.g., broken link, missing attribute, accessibility issue), apply it to all themes.
   - If adding a feature (e.g., new meta tag, analytics script), apply it to all themes.

2. **Apply to All Themes:**
   ```powershell
   # Example: Fixing a meta tag in all index.html files
   $themes = Get-ChildItem -Path "themes" -Directory
   foreach ($theme in $themes) {
       # Apply same fix to themes/$theme/index.html
   }
   ```

3. **Exception: Design-Specific Content**
   - Only apply fixes that affect **logic, structure, accessibility, or SEO**.
   - Do NOT synchronize:
     - Colors (e.g., `class="bg-red-500"` in one theme vs `class="bg-blue-500"` in another)
     - Images (e.g., `hero-pizza.jpg` vs `hero-burger.jpg`)
     - Text content (e.g., "Restaurante Italiano" vs "Hamburgueria Gourmet")
     - Theme-specific sections (e.g., `buy.html` only exists in hamburgueria)

4. **Verification:**
   - After applying fixes, run `select-theme.js` for each theme and visually inspect that:
     - The fix is present
     - The design is NOT broken

## Examples

### ✅ Good: Apply to All Themes
- Adding `rel="noopener"` to external links
- Fixing broken `<meta charset="UTF-8">`
- Adding ARIA labels for accessibility
- Updating CDN links (e.g., Tailwind CSS version)

### ❌ Bad: Do NOT Apply to All Themes
- Changing "Bem-vindo ao Restaurante" to "Bem-vindo à Hamburgueria"
- Replacing `hero-restaurant.jpg` with a different image
- Changing `bg-amber-500` to `bg-red-600`

## Automation Helpers

```javascript
// scripts/apply-fix-to-all-themes.js (example)
const fs = require('fs');
const path = require('path');

const themesDir = path.join(__dirname, '../themes');
const themes = fs.readdirSync(themesDir).filter(d => 
  fs.statSync(path.join(themesDir, d)).isDirectory()
);

themes.forEach(theme => {
  const file = path.join(themesDir, theme, 'index.html');
  let content = fs.readFileSync(file, 'utf8');
  
  // Example: Add a meta tag
  content = content.replace(
    '</head>',
    '  <meta name="theme-color" content="#FFFFFF">\n</head>'
  );
  
  fs.writeFileSync(file, content);
  console.log(`✅ Fixed ${theme}/index.html`);
});
```
