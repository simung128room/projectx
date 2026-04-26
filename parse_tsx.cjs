const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

let depth = 0;
for (let i = 1820; i <= 1945; i++) {
  let line = lines[i];
  if (line.includes('//') || line.includes('{/*')) continue;
  
  const opens = (line.match(/<div(>|\s)/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  
  if (opens > 0 || closes > 0) {
    depth += opens;
    depth -= closes;
    console.log(`Line ${i+1}: opened ${opens}, closed ${closes}, depth now ${depth}`);
  }
}
