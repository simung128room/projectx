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

    // Remaining dark hovering / selection
    content = content.replace(/bg-\[#111111\]/g, 'bg-gray-50');
    content = content.replace(/bg-\[#161616\]/g, 'bg-gray-100');
    content = content.replace(/bg-\[#ffffff\]/g, 'bg-black');
    content = content.replace(/text-\[#0a0a0a\]/g, 'text-white');
    content = content.replace(/hover:bg-\[#111111\]/g, 'hover:bg-gray-100');
    content = content.replace(/hover:bg-\[#e0e0e0\]/g, 'hover:bg-gray-800');
    
    // Text grays
    content = content.replace(/text-\[#888888\]/g, 'text-gray-500');

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
