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

    // Remaining dark colors
    content = content.replace(/bg-\[#121820\]/g, 'bg-gray-100');
    content = content.replace(/bg-\[#12161E\]/g, 'bg-gray-50');
    content = content.replace(/bg-\[#151A23\]/g, 'bg-white');
    content = content.replace(/bg-\[#121417\]/g, 'bg-gray-100');
    
    // Some text zinc mapping just in case
    content = content.replace(/\btext-zinc-400\b/g, 'text-gray-500');
    content = content.replace(/\btext-zinc-600\b/g, 'text-gray-500');
    content = content.replace(/\btext-zinc-700\b/g, 'text-gray-600');
    content = content.replace(/\btext-zinc-800\b/g, 'text-gray-700');

    // Make sure we have a little bit of blue. "มีน้ำเงินนิดหน่อย"
    // I already did emerald to blue, purple to blue.

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
