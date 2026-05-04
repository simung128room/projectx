const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/status: 'ok',/g, "status: 'ok_proof',");
fs.writeFileSync('server.ts', code);
