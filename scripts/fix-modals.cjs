const fs = require('fs');
const path = require('path');

const modalsDir = path.join(__dirname, '../src/components/modals');
const files = fs.readdirSync(modalsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(modalsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Insert useEffect import if not present, though React might already be imported.
  // Actually, let's just add it to the main div.
  
  if(!content.includes('role="dialog"')) {
      content = content.replace(/<div( className="fixed inset-0[^>]+)>/, `<div$1 role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} tabIndex={-1} autoFocus>`);
  }
  
  fs.writeFileSync(filePath, content);
}
console.log('Fixed modals');
