const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

if (code.includes('app.get(\'/api/settings\',')) {
  code = code.replace(
    /app\.get\('\/api\/settings', async \(req: any, res: any\) => \{/,
    `app.get('/api/settings', async (req: any, res: any) => {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=86400');`
  );
  fs.writeFileSync('server.ts', code);
}
