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

    // Backgrounds
    content = content.replace(/bg-\[#050505\]/g, 'bg-white');
    content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-gray-50');
    content = content.replace(/bg-\[#121212\]/g, 'bg-gray-100');
    
    // Using string replacements to avoid regex parsing issues where possible
    content = content.replace(/bg-black\/20/g, 'bg-white/80');
    content = content.replace(/bg-black\/40(?! backdrop-blur)/g, 'bg-white/90');
    // Keep overlays dark-ish but lighter maybe, or just keep them black/40
    
    // Cards & elements
    content = content.replace(/bg-zinc-900/g, 'bg-gray-50');
    content = content.replace(/bg-zinc-800/g, 'bg-gray-100');
    content = content.replace(/bg-zinc-950/g, 'bg-gray-50');
    
    // Re-map simple bg-black inside components BUT not inside black/40 overlays
    // Need a careful replace for bg-black (only word boundaries without /)
    content = content.replace(/\bbg-black\b(?!\/)/g, 'bg-white');

    // Text colors
    content = content.replace(/\btext-white\b/g, 'text-gray-900');
    content = content.replace(/\btext-zinc-100\b/g, 'text-gray-900');
    content = content.replace(/\btext-zinc-200\b/g, 'text-gray-800');
    content = content.replace(/\btext-zinc-300\b/g, 'text-gray-700');
    content = content.replace(/\btext-zinc-400\b/g, 'text-gray-600');
    content = content.replace(/\btext-zinc-500\b/g, 'text-gray-500');

    // Hover bg
    content = content.replace(/hover:bg-white\/10/g, 'hover:bg-blue-50');
    content = content.replace(/hover:bg-white\/5/g, 'hover:bg-gray-100');

    // Borders
    content = content.replace(/border-white\/10/g, 'border-gray-200');
    content = content.replace(/border-white\/5/g, 'border-gray-200');
    content = content.replace(/border-white\/20/g, 'border-gray-300');
    content = content.replace(/border-zinc-800/g, 'border-gray-200');

    // Touches of blue (replacing some generic highlights with blue if not already there)
    // The user wants "มีน้ำเงินนิดหน่อย". We can change emerald/green buttons to blue if desired,
    // but typically "text-emerald-400" is for success.
    // Let's replace generic active highlights maybe? 
    // They asked for black and white and a little blue.
    content = content.replace(/text-emerald-400/g, 'text-blue-600');
    content = content.replace(/text-emerald-500/g, 'text-blue-500');
    content = content.replace(/bg-emerald-500/g, 'bg-blue-600');
    content = content.replace(/bg-emerald-600/g, 'bg-blue-700');
    content = content.replace(/hover:bg-emerald-600/g, 'hover:bg-blue-700');
    
    // Purples/indigo -> Blue
    content = content.replace(/text-purple-400/g, 'text-blue-600');
    content = content.replace(/text-purple-500/g, 'text-blue-600');
    content = content.replace(/bg-purple-500/g, 'bg-blue-600');
    content = content.replace(/from-purple-500/g, 'from-blue-600');
    content = content.replace(/to-blue-500/g, 'to-cyan-500');
    
    // Replace selection color
    content = content.replace(/selection:bg-white\/20/g, 'selection:bg-blue-500/20');
    content = content.replace(/selection:bg-black\/20/g, 'selection:bg-blue-500/20');

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
