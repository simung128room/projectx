const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Insert global response time middleware
const metricsMiddleware = `
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const time = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
    res.setHeader('X-Response-Time-Ms', time);
  });
  next();
});
`;

if (!code.includes('X-Response-Time-Ms')) {
  code = code.replace(/const app = express\(\);/, 'const app = express();' + metricsMiddleware);
}

fs.writeFileSync('server.ts', code);
