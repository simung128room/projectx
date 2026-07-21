const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import {\nimport { FloatingElements } from './components/FloatingElements';", "import { FloatingElements } from './components/FloatingElements';\nimport {");
fs.writeFileSync(file, content);
