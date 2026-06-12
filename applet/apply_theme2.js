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

    content = content.replace(/hover:bg-\[\#0a0a0c\]/g, 'hover:bg-white/[0.04]');
    content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-white/[0.06]'); // slightly brighter for active item
    content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-white/[0.04]');
    content = content.replace(/bg-\[\#0a0a0a\]/g, 'bg-[#050505]');
    content = content.replace(/bg-\[\#111111\]/g, 'bg-[#0a0a0a]');

    // Emulate cursor green text elements 
    content = content.replace(/text-emerald-500/g, 'text-[#10b981]');
    content = content.replace(/text-emerald-400/g, 'text-[#10b981]');
    content = content.replace(/text-emerald-600/g, 'text-[#10b981]');
    content = content.replace(/text-emerald-500\/90/g, 'text-[#10b981]');
    
    // Backgrounds
    content = content.replace(/bg-emerald-500/g, 'bg-[#10b981]');
    content = content.replace(/bg-emerald-600/g, 'bg-[#10b981]');
    content = content.replace(/bg-emerald-400/g, 'bg-[#10b981]');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
