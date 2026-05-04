const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/PORT = 3000/g, "PORT = 3001");
code = code.replace(/app\.listen\(3000/g, "app.listen(3001");
fs.writeFileSync('server_test.ts', code);
