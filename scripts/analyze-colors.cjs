const fs = require('fs');
const files = [
  'src/components/modals/AuthModal.tsx',
  'src/components/modals/KeyModal.tsx',
  'src/components/modals/PolicyModals.tsx',
  'src/components/modals/ReceiptModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let matches = content.match(/(bg|border|text|from|to|via)-[a-zA-Z0-9#\/\[\]\-]+/g) || [];
  console.log('---', file);
  console.log([...new Set(matches)].sort().join('\n'));
});
