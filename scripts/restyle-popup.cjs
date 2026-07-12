const fs = require('fs');
const file = 'src/components/PopupBanner.tsx';
let content = fs.readFileSync(file, 'utf8');

// Colors
content = content.replace(/bg-zinc-900/g, 'bg-card');
content = content.replace(/bg-zinc-950/g, 'bg-card');
content = content.replace(/bg-zinc-800\/80/g, 'border-border');
content = content.replace(/border-zinc-800\/60/g, 'border-border');
content = content.replace(/bg-blue-500\/10/g, 'bg-primary/10');
content = content.replace(/border-blue-500\/20/g, 'border-primary/20');
content = content.replace(/text-blue-450/g, 'text-primary');
content = content.replace(/text-zinc-100/g, 'text-foreground');
content = content.replace(/text-zinc-300/g, 'text-muted-foreground');
content = content.replace(/border-zinc-700/g, 'border-border');
content = content.replace(/group-hover:border-zinc-600/g, 'group-hover:border-primary/50');
content = content.replace(/bg-blue-600/g, 'bg-primary');
content = content.replace(/hover:bg-blue-500/g, 'hover:bg-primary/90');
content = content.replace(/shadow-blue-500\/15/g, 'shadow-primary/20');
content = content.replace(/border-blue-600/g, 'border-primary');
content = content.replace(/bg-red-500/g, 'bg-destructive');
content = content.replace(/hover:bg-red-600/g, 'hover:bg-destructive/90');
content = content.replace(/shadow-red-500\/25/g, 'shadow-destructive/25');
content = content.replace(/text-zinc-350/g, 'text-foreground');

fs.writeFileSync(file, content);
console.log('Restyled PopupBanner');
