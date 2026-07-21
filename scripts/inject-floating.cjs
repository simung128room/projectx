const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStr = "import { FloatingElements } from './components/FloatingElements';\n";

if (!content.includes('FloatingElements')) {
  // Add import after other imports
  const lastImport = content.lastIndexOf('import ');
  const endOfLastImport = content.indexOf('\n', lastImport);
  content = content.substring(0, endOfLastImport + 1) + importStr + content.substring(endOfLastImport + 1);
  
  // Add component before footer
  const footerStart = content.indexOf('{/* Footer */}');
  if (footerStart !== -1) {
    content = content.substring(0, footerStart) + '<FloatingElements />\n          ' + content.substring(footerStart);
    fs.writeFileSync(file, content);
    console.log('Injected FloatingElements');
  } else {
    console.log('Could not find Footer in App.tsx');
  }
} else {
  console.log('FloatingElements already injected');
}
