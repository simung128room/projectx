const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/app\.get\('\/api\/stats', async \(req, res\) => \{/, "app.get('/api/stats', async (req, res) => {\nconsole.log('HIT STATS ENDPOINT');");
fs.writeFileSync('server.ts', code);
