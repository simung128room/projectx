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

    // Convert excessive borders to thin sleek borders
    content = content.replace(/border-white\/\[0\.1\]/g, 'border-white/[0.04]');
    content = content.replace(/border-white\/10/g, 'border-white/[0.04]');
    content = content.replace(/border-white\/20/g, 'border-white/[0.06]');

    // Convert large corners to smaller ones (Cursor style)
    content = content.replace(/rounded-3xl/g, 'rounded-md');
    // content = content.replace(/rounded-2xl/g, 'rounded-sm');
    content = content.replace(/rounded-xl/g, 'rounded-md');
    content = content.replace(/rounded-lg/g, 'rounded-md');
    
    // Convert shadows
    content = content.replace(/shadow-xl/g, 'shadow-md');
    content = content.replace(/shadow-2xl/g, 'shadow-md');
    content = content.replace(/shadow-lg/g, 'shadow-sm');

    // Make backgrounds flatter
    content = content.replace(/bg-zinc-900/g, 'bg-[#0a0a0a]');
    content = content.replace(/bg-zinc-800/g, 'bg-[#111111]');
    content = content.replace(/bg-\[\#040406\]/g, 'bg-[#000000]'); // Sidebar base
    content = content.replace(/bg-\[\#030303\]/g, 'bg-[#000000]'); // Background
    content = content.replace(/bg-\[\#070709\]/g, 'bg-[#000000]'); // Fallback

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
