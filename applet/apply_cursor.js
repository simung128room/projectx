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

    // Remove glows and blurs
    content = content.replace(/blur-\[.*?\]/g, '');
    content = content.replace(/drop-shadow-\[.*?\]/g, '');
    content = content.replace(/shadow-\[.*?\]/g, 'shadow-sm');

    // Simplify backgrounds
    content = content.replace(/bg-gradient-to-[a-z]+ from-[^\s]+ hover:from-[^\s]+ hover:to-[^\s]+/g, 'bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20');
    content = content.replace(/bg-gradient-to-[a-z]+ from-[^\s]+ to-[^\s]+/g, 'bg-[#09090b]');
    content = content.replace(/bg-gradient-to-[a-z]+ from-[^\s]+ via-[^\s]+ to-[^\s]+/g, 'bg-[#09090b]');
    
    // Flatten cards
    content = content.replace(/bg-card/g, 'bg-[#09090b]');
    content = content.replace(/border-border/g, 'border-[#1e1e1e]');
    
    // Cursor style typography
    content = content.replace(/font-black/g, 'font-semibold');
    content = content.replace(/font-extrabold/g, 'font-semibold');
    content = content.replace(/font-bold/g, 'font-medium');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
