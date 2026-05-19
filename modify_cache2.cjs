const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Also inject stale-while-revalidate for /api/products
code = code.replace(
  /app\.get\('\/api\/products', async \(req: any, res: any\) => \{/,
  `app.get('/api/products', async (req: any, res: any) => {
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=59');`
);

code = code.replace(
  /app\.get\('\/api\/categories', async \(req: any, res: any\) => \{/,
  `app.get('/api/categories', async (req: any, res: any) => {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=86400');`
);

code = code.replace(
  /app\.get\('\/api\/pages', async \(req: any, res: any\) => \{/,
  `app.get('/api/pages', async (req: any, res: any) => {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=86400');`
);

fs.writeFileSync('server.ts', code);
