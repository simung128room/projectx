const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.get\('\/api\/stats', async \(req, res\) => \{/g;
if (code.match(regex)) {
  console.log("FOUND API STATS!");
} else {
  console.log("NOT FOUND API STATS!");
}
