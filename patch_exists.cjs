const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/\.exists\(\)/g, ".exists");
fs.writeFileSync('server.ts', code);
