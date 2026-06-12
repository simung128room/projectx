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

    // Remove green glows
    content = content.replace(/shadow-\[0_0_8px_#00FF66\]/g, '');
    content = content.replace(/shadow-\[0_0_8px_rgba\(0,255,102,0\.6\)\]/g, '');
    content = content.replace(/drop-shadow-\[0_0_15px_rgba\(16,185,129,0\.3\)\]/g, '');
    content = content.replace(/drop-shadow-\[0_0_15px_rgba\(255,255,255,0\.1\)\]/g, '');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
