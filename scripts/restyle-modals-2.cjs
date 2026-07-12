const fs = require('fs');

const files = [
  'src/components/modals/AuthModal.tsx',
  'src/components/modals/KeyModal.tsx',
  'src/components/modals/PolicyModals.tsx',
  'src/components/modals/ReceiptModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix ReceiptModal
  content = content.replace(/bg-blue-600\/10/g, 'bg-primary/10');
  content = content.replace(/border-blue-500\/20/g, 'border-primary/20');
  content = content.replace(/bg-blue-500\/10/g, 'bg-primary/10');
  content = content.replace(/bg-blue-600/g, 'bg-primary');
  content = content.replace(/bg-blue-500/g, 'bg-primary');
  content = content.replace(/bg-zinc-700/g, 'bg-muted');
  content = content.replace(/bg-zinc-800/g, 'bg-card');
  content = content.replace(/border-zinc-700/g, 'border-border');
  content = content.replace(/text-zinc-300/g, 'text-muted-foreground');
  content = content.replace(/bg-zinc-950\/40/g, 'bg-background/40');
  content = content.replace(/bg-cardmerald-500\/10/g, 'bg-primary/10');
  content = content.replace(/text-emerald-400/g, 'text-primary');

  // KeyModal
  content = content.replace(/border-\[\#364153\]/g, 'border-primary');

  fs.writeFileSync(file, content);
});
console.log('Fixed more colors');
