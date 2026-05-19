const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/limit\(1000\)/g, 'limit(100)');
code = code.replace(
  /app\.get\('\/api\/categories', async \(req, res\) => \{/,
  `app.get('/api/categories', async (req, res) => {\n    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=86400');`
);
code = code.replace(
  /app\.get\('\/api\/pages', async \(req, res\) => \{/,
  `app.get('/api/pages', async (req, res) => {\n    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=86400');`
);

fs.writeFileSync('server.ts', code);
