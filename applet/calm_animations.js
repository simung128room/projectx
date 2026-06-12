import fs from 'fs';
import path from 'path';

let content = fs.readFileSync('src/components/HomeView.tsx', 'utf8');
let original = content;

// Remove floating animations, scale animations, translates
content = content.replace(/hover:-translate-y-1/g, '');
content = content.replace(/hover:scale-105/g, '');
content = content.replace(/whileHover={{ y: -2, transition: { duration: 0.2 } }}/g, '');
content = content.replace(/whileTap={{ scale: 0.95 }}/g, '');
content = content.replace(/group-hover:-translate-y-1/g, '');
content = content.replace(/transition-transform duration-500/g, '');
content = content.replace(/transition-all duration-300/g, 'transition-colors duration-200');

// Same for other main views
fs.writeFileSync('src/components/HomeView.tsx', content, 'utf8');

function calmDown(file) {
    if (!fs.existsSync(file)) return;
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/hover:-translate-y-1/g, '');
    c = c.replace(/hover:scale-105/g, '');
    c = c.replace(/whileHover={{ [^{]* }}/g, '');
    c = c.replace(/whileTap={{ [^{]* }}/g, '');
    c = c.replace(/transition-transform duration-500/g, '');
    c = c.replace(/transition-all duration-300/g, 'transition-colors duration-200');
    fs.writeFileSync(file, c, 'utf8');
}

calmDown('src/components/CategoryProductsView.tsx');
calmDown('src/components/CategoryCard.tsx');
calmDown('src/components/WalletView.tsx');
calmDown('src/components/ToolsView.tsx');
calmDown('src/components/ProductDetailView.tsx');

console.log("Calmed down animations");
