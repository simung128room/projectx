const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/modals/PolicyModals.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/ role="dialog" aria-modal="true">/g, `>`);

fs.writeFileSync(filePath, content);
console.log('Fixed PolicyModals duplicate');
