const fs = require('fs');
const path = require('path');

const themesDir = path.join(__dirname, '..', 'themes');
// Lite themes already have the loader embedded — the duplicate guard below handles them safely
const themes = ['restaurante', 'hamburgueria', 'pizzaria', 'restaurant-lite', 'burger-lite', 'pizza-lite', 'acai'];

const cssSnippet = `
        /* Global Loader */
        body:not(.config-loaded) { overflow: hidden; }
        body:not(.config-loaded) #global-loader { opacity: 1; visibility: visible; }
        body.config-loaded #global-loader { opacity: 0; visibility: hidden; pointer-events: none; }
    </style>`;

const htmlSnippet = `<body>
    <!-- Global Loader (prevent FOUC) -->
    <div id="global-loader" class="fixed inset-0 z-[99999] flex items-center justify-center bg-dark-900 transition-all duration-800">
        <div class="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    </div>`;

themes.forEach(theme => {
    const themePath = path.join(themesDir, theme);
    if (!fs.existsSync(themePath)) {
        console.log("Directory not found: " + themePath);
        return;
    }

    const files = fs.readdirSync(themePath).filter(f => f.endsWith('.html') && f !== 'admin.html');

    files.forEach(file => {
        const filePath = path.join(themePath, file);
        let content = fs.readFileSync(filePath, 'utf-8');

        let modified = false;

        // Inject CSS
        if (!content.includes('/* Global Loader */') && content.includes('</style>')) {
            content = content.replace('</style>', cssSnippet);
            modified = true;
        }

        // Inject HTML
        if (!content.includes('id="global-loader"') && content.includes('<body>')) {
            content = content.replace('<body>', htmlSnippet);
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log("✅ Injected loader into " + theme + "/" + file);
        } else {
            console.log("⚠️ Loader already present or tags missing in " + theme + "/" + file);
        }
    });
});
