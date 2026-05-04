const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/\.update, /g, ".update(");
fs.writeFileSync('server.ts', code);
