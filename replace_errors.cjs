const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/res\.status\(500\)\.json\(\{ error: 'Internal server error' \}\);/g, "res.status(500).json({ error: err?.details || err?.message || 'Internal server error' });");
fs.writeFileSync('server.ts', code);
