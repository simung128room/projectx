const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const replacement = 'let errorMsg = e.response?.data?.error || e.message || "Unknown Error";\n          if (typeof errorMsg === "object") errorMsg = JSON.stringify(errorMsg);\n          setDbErrorDetail(`Backend API ไม่ตอบสนอง (Offline): ${errorMsg}`);';
code = code.replace(/let errorMsg =\s*e\.response\?\.data\?\.error \|\| e\.message \|\| [^;]+;\s*setDbErrorDetail\([^)]+\);/, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log('App patched');
