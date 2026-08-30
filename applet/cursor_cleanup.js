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

    content = content.replace(/blur-xl/g, '');
    content = content.replace(/blur-2xl/g, '');
    content = content.replace(/blur-3xl/g, '');
    content = content.replace(/<div className="absolute[^"]*bg-neon-green\/5[^"]*"><\/div>/g, '');
    content = content.replace(/<div className="absolute[^"]*bg-\[#10b981\]\/5[^"]*"><\/div>/g, '');
    content = content.replace(/<div className="absolute[^"]*bg-primary\/5[^"]*"><\/div>/g, '');

    // Make borders of everything 1px and the same subtle color: #1e1e24 -> actually cursor uses #1e1e1e or white/[0.04]
    // Cursor typically uses #1e1e1e for its primary borders and #0a0a0a for backgrounds.
    // Ensure all standard borders are #1e1e1e.
    content = content.replace(/border-white\/\[[0-9.]+\]/g, 'border-[#1e1e1e]');
    content = content.replace(/border-zinc-[1-9]00/g, 'border-[#1e1e1e]');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
