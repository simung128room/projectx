const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  let updated = false;

  // Replace background: '#ffffff', color: '#1f2937' with dark mode equivalents
  if (content.includes("background: '#ffffff'") || content.includes('background: "#ffffff"')) {
    content = content.replace(/background:\s*['"]#ffffff['"]/g, "background: '#1f1c14'");
    updated = true;
  }
  
  if (content.includes("color: '#1f2937'") || content.includes('color: "#1f2937"')) {
    content = content.replace(/color:\s*['"]#1f2937['"]/g, "color: '#f5f0e8'");
    updated = true;
  }

  // Same for `#121212` and `#0a0a0a` and `#0F0F0F` -> `#1f1c14`
  if (content.match(/background:\s*['"]#(121212|0a0a0a|0F0F0F|11131a)['"]/)) {
    content = content.replace(/background:\s*['"]#(121212|0a0a0a|0F0F0F|11131a)['"]/g, "background: '#1f1c14'");
    updated = true;
  }

  // color '#fff' to '#f5f0e8'
  if (content.match(/color:\s*['"]#(fff|ffffff)['"]/i)) {
    // only if the file isn't meant to be bright (which nothing should be)
    content = content.replace(/color:\s*['"]#(fff|ffffff)['"]/gi, "color: '#f5f0e8'");
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(file, content);
    console.log('Fixed Swal in', file);
  }
});
