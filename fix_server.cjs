import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// 1. Remove the async wrapper
content = content.replace('async function startServer() {', '');
content = content.replace('const app = express();', 'export const app = express();');

// 2. Remove the app.listen in the middle
content = content.replace(/\/\/ Listen on port 3000 IMMEDIATELY[\s\S]*?\}\);/m, '');

// 3. Fix the bottom part
const bottomRegex = /  if \(process\.env\.NODE_ENV !== "production" && !process\.env\.VERCEL\) \{[\s\S]*?startServer\(\)\.catch\(err => \{\n  console\.error\('CRITICAL: Server failed to start:', err\);\n\}\);/m;

const newBottom = `
if (!process.env.VERCEL) {
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite middleware (async)...");
    createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    }).then(vite => {
      app.use(vite.middlewares);
      console.log("Vite middleware attached.");
      app.listen(3000, "0.0.0.0", () => {
        console.log(\`[Server] Listening on http://0.0.0.0:3000\`);
      });
    }).catch(err => {
      console.error("Failed to initialize Vite middleware:", err);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    app.listen(3000, "0.0.0.0", () => {
      console.log(\`[Server] Listening on http://0.0.0.0:3000\`);
    });
  }
}
export default app;
`;

content = content.replace(bottomRegex, newBottom);

// 4. Also remove the end bracket of startServer() which was right before \`import fs from 'node:fs';\`
content = content.replace(/  return app;\n\}\n\nimport fs from 'node:fs';/, "import fs from 'node:fs';");

fs.writeFileSync('server.ts', content);
