import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        let fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(fullPath));
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Backgrounds - revert `bg-white` to `bg-[#050505]`, then fix `/xx` opacities to use `black/xx` as approximating the old code.
    content = content.replace(/bg-white/g, 'bg-[#050505]');
    content = content.replace(/bg-gray-50/g, 'bg-[#0a0a0a]');
    content = content.replace(/bg-gray-100/g, 'bg-[#121212]');
    content = content.replace(/bg-gray-200/g, 'bg-[#1e1e1e]');
    content = content.replace(/bg-[#050505]\/80/g, 'bg-black/20');
    content = content.replace(/bg-[#050505]\/90/g, 'bg-black/40');
    content = content.replace(/bg-[#050505]\/50/g, 'bg-black/50');

    // Cards & elements back to dark
    content = content.replace(/\btext-gray-900\b/g, 'text-white');
    content = content.replace(/\btext-gray-800\b/g, 'text-zinc-200');
    content = content.replace(/\btext-gray-700\b/g, 'text-zinc-300');
    content = content.replace(/\btext-gray-600\b/g, 'text-zinc-400');
    content = content.replace(/\btext-gray-500\b/g, 'text-zinc-500');
    
    // Some hover bg
    content = content.replace(/hover:bg-blue-50/g, 'hover:bg-white/10');
    
    // Borders
    content = content.replace(/border-gray-200/g, 'border-white/10');
    content = content.replace(/border-gray-300/g, 'border-white/20');

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
