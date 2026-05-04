const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(/siteStats\.users\.toLocaleString\(\)/g, '(siteStats?.users || 0).toLocaleString()');
code = code.replace(/siteStats\.stock\.toLocaleString\(\)/g, '(siteStats?.stock || 0).toLocaleString()');
code = code.replace(/siteStats\.sales\.toLocaleString\(\)/g, '(siteStats?.sales || 0).toLocaleString()');
code = code.replace(/siteStats\.users;/g, '(siteStats?.users || 0);');
code = code.replace(/siteStats\.stock;/g, '(siteStats?.stock || 0);');
code = code.replace(/siteStats\.sales;/g, '(siteStats?.sales || 0);');

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
