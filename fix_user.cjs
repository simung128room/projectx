const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/req\.user\?/g, "(req as any).user?");
code = code.replace(/req\.user\./g, "(req as any).user.");
fs.writeFileSync('server.ts', code);
