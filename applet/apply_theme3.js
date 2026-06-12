import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Convert stray cursor colors
    content = content.replace(/bg-\[\#0a0a0c\]/g, 'bg-[#000000]');
    content = content.replace(/hover:bg-\[\#0a0a0c\]/g, 'hover:bg-white/[0.04]');
    content = content.replace(/rounded-xl/g, 'rounded-md');
    content = content.replace(/rounded-2xl/g, 'rounded-md');
    // Drop borders shadows
    content = content.replace(/shadow-\[0_4px_12px_rgba.*?\]/g, 'shadow-sm');
    content = content.replace(/shadow-\[0_4px_24px_rgba.*?\]/g, 'shadow-sm');
    content = content.replace(/bg-gradient-to-r from-emerald-500\/0 via-emerald-500\/20 to-emerald-500\/0/g, 'bg-white/[0.04]');
    content = content.replace(/bg-gradient-to-r from-emerald-500\/0 via-emerald-500\/20 to-indigo-500\/0/g, 'bg-white/[0.04]');
    content = content.replace(/shadow-emerald-500\/50/g, 'shadow-sm');

    // Make text weights slightly lighter for Cursor look
    content = content.replace(/font-black/g, 'font-semibold');
    content = content.replace(/font-extrabold/g, 'font-semibold');

    // Make buy buttons less garish
    content = content.replace(/bg-\[\#10b981\] hover:bg-\[\#0fd792\] text-black/g, 'bg-white/[0.04] hover:bg-white/[0.08] text-[#10b981] border border-white/[0.04] hover:border-[#10b981]');

    // Strip glow
    content = content.replace(/shadow-\[0_0_15px_rgba\(255,255,255,0\.1\)\]/g, '');
    content = content.replace(/animate-pulse/g, ''); 

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
