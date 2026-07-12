const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  let updated = false;

  // Replace confirmButtonColor: '#364153' and similar to '#de7356'
  if (content.match(/confirmButtonColor:\s*['"]#(364153|3b82f6|16a34a|2563eb|0084ff|000000|ffe300)['"]/i)) {
    content = content.replace(/confirmButtonColor:\s*['"]#(364153|3b82f6|16a34a|2563eb|0084ff|000000|ffe300)['"]/gi, "confirmButtonColor: '#de7356'");
    updated = true;
  }
  
  if (content.match(/confirmButtonColor:\s*['"]#(EF4444|dc2626|ef4444|ff2c2c)['"]/i)) {
    content = content.replace(/confirmButtonColor:\s*['"]#(EF4444|dc2626|ef4444|ff2c2c)['"]/gi, "confirmButtonColor: '#de7356'");
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(file, content);
    console.log('Fixed Swal Colors in', file);
  }
});
