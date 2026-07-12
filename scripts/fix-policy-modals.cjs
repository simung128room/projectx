const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/modals/PolicyModals.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/className="fixed inset-0[^"]+"/g, `$& role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} tabIndex={-1} autoFocus`);

fs.writeFileSync(filePath, content);
console.log('Fixed PolicyModals');
