const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/console\.error\('Internal server error fetching products:', err\.message \|\| err\);/g, "console.error('PROD ERR OBJ:', JSON.stringify(err, Object.getOwnPropertyNames(err)));");
fs.writeFileSync('server.ts', code);
