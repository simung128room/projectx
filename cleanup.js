import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// simplify layouts and remove excessive blobs
content = content.replace(/rounded-3xl/g, 'rounded-xl');
content = content.replace(/rounded-2xl/g, 'rounded-xl');
content = content.replace(/className="absolute.*?blur-\[60px\].*?"/g, ''); // Remove decorative blobs
content = content.replace(/bg-\[#151518\]\/[0-9]+/g, 'bg-zinc-900 border-zinc-800');
content = content.replace(/shadow-xl/g, 'shadow-sm');
content = content.replace(/shadow-\[.*?\]/g, ''); // remove custom glow shadows
content = content.replace(/drop-shadow-\[.*?\]/g, ''); 
content = content.replace(/text-cyan-400 font-bold drop-shadow-\[.*?\]/g, 'text-primary font-medium');
content = content.replace(/bg-cyan-/g, 'bg-primary/');
content = content.replace(/text-cyan-/g, 'text-primary');
content = content.replace(/border-cyan-/g, 'border-primary/');

// Fix remaining empty div after regex replace
content = content.replace(/<div >\s*<\/div>/g, '');

fs.writeFileSync('src/App.tsx', content);

// add primary color to tailwind if needed, we'll just let it default or map to a color
