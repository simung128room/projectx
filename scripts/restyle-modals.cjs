const fs = require('fs');

const files = [
  'src/components/modals/AuthModal.tsx',
  'src/components/modals/KeyModal.tsx',
  'src/components/modals/PolicyModals.tsx',
  'src/components/modals/ReceiptModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Colors
  content = content.replace(/bg-\[\#364153\]\/10/g, 'bg-primary/10');
  content = content.replace(/bg-\[\#364153\]\/20/g, 'bg-primary/20');
  content = content.replace(/text-\[\#364153\]/g, 'text-primary');
  content = content.replace(/border-\[\#364153\]\/20/g, 'border-primary/20');
  content = content.replace(/border-\[\#364153\]\/25/g, 'border-primary/25');
  content = content.replace(/border-\[\#374151\]/g, 'border-border');
  content = content.replace(/border-emerald-500\/20/g, 'border-primary/20');
  content = content.replace(/focus:border-emerald-500\/50/g, 'focus:border-primary/50');
  content = content.replace(/bg-\[\#364153\]/g, 'bg-primary');
  content = content.replace(/hover:bg-\[\#364153\]/g, 'hover:bg-primary/90');
  content = content.replace(/bg-cardmerald-700/g, 'bg-primary/80');
  content = content.replace(/from-\[\#364153\]/g, 'from-primary');
  content = content.replace(/to-emerald-700/g, 'to-primary/80');
  content = content.replace(/hover:from-emerald-400/g, 'hover:from-primary/90');
  content = content.replace(/hover:to-emerald-600/g, 'hover:to-primary');
  content = content.replace(/border-\[\#1f293d\]/g, 'border-border');
  content = content.replace(/bg-\[\#0d0f15\]/g, 'bg-card');
  content = content.replace(/bg-\[\#1e1e1e\]/g, 'bg-muted');

  fs.writeFileSync(file, content);
});
console.log('Done replacing colors in modals');
