const fs = require('fs');
const file = 'src/index.css';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  --color-background: #0a0e1a;
  --color-surface: #1a1f35;
  --color-border: #1e293b;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-accent: #00d4aa;
  --color-user-bubble: #1a1f35;
  --color-input-bg: #1a1f35;`;

const newStr = `  --color-background: transparent;
  --color-surface: rgba(255, 255, 255, 0.03);
  --color-border: rgba(255, 255, 255, 0.1);
  --color-text-primary: #ffffff;
  --color-text-secondary: rgba(255, 255, 255, 0.6);
  --color-accent: #00d4aa;
  --color-user-bubble: rgba(255, 255, 255, 0.05);
  --color-input-bg: rgba(0, 0, 0, 0.2);`;

content = content.replace(targetStr, newStr);

// Now update the body background in index.css to be a nice mesh gradient
const bodyRegex = /html,\s*body\s*\{([\s\S]*?)\}/;
const match = bodyRegex.exec(content);
if (match) {
  let bodyContent = match[1];
  bodyContent = bodyContent.replace(/background-color: var\(--color-background\);/, 
    `background: radial-gradient(circle at 15% 50%, rgba(20, 11, 46, 1), transparent 50%), radial-gradient(circle at 85% 30%, rgba(10, 14, 26, 1), transparent 50%), linear-gradient(135deg, #0f172a 0%, #020617 100%);
    background-attachment: fixed;
    background-color: #020617;`);
  content = content.replace(bodyRegex, `html, body {${bodyContent}}`);
}

fs.writeFileSync(file, content);
console.log('Updated index.css');
