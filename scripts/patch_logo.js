const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'themes', 'pizzaria');
const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.html'));

const oldSvgRegex = /<svg class="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"[\s\S]*?stroke-width="1\.5">[\s\S]*?<path stroke-linecap="round" stroke-linejoin="round"[\s\S]*?d="M12 8\.25v-1\.5m0 1\.5c-1\.355 0-2\.697\.056-4\.024\.166C6\.845 8\.51 6 9\.473 6 10\.608v2\.513m6-4\.871c1\.355 0 2\.697\.056 4\.024\.166C17\.155 8\.51 18 9\.473 18 10\.608v2\.513M15 8\.25v-1\.5m-6 1\.5v-1\.5m12 9\.75l-1\.5\.75a3\.354 3\.354 0 01-3 0 3\.354 3\.354 0 00-3 0 3\.354 3\.354 0 01-3 0 3\.354 3\.354 0 00-3 0 3\.354 3\.354 0 01-3 0L3 16\.5m15-3\.379a48\.474 48\.474 0 00-6-\.371c-2\.032 0-4\.034\.126-6 \.371m12 0c\.39\.049\.777\.102 1\.163\.16 1\.07\.16 1\.837 1\.094 1\.837 2\.175v5\.169c0 \.621-\.504 1\.125-1\.125 1\.125H4\.125A1\.125 1\.125 0 013 20\.625v-5\.17c0-1\.08\.768-2\.014 1\.837-2\.174A47\.78 47\.78 0 016 13\.12M16\.5 3\.75V16\.5" \/>[\s\S]*?<\/svg>/g;

const newSvg = `<svg class="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M15 11h.01"></path>
                            <path d="M11 15h.01"></path>
                            <path d="M16 16h.01"></path>
                            <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16"></path>
                            <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4"></path>
                        </svg>`;

for (const file of files) {
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.match(oldSvgRegex)) {
        content = content.replace(oldSvgRegex, newSvg);
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`Skipped ${file}`);
    }
}
