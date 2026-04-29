import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/bg-\[#151518\]/g, 'bg-zinc-900 border-zinc-800');
    content = content.replace(/bg-\[#09090b\]/g, 'bg-zinc-950');
    content = content.replace(/shadow-2xl/g, 'shadow-xl');
    content = content.replace(/shadow-\[0_0_50px_rgba\(0,0,0,0\.5\)\]/g, 'shadow-xl');

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
