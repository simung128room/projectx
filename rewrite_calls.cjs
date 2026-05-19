const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/await getCachedCollection\('products'\)/g, "await getCachedCollection('products', 20000, res)");
code = code.replace(/await getCachedCollection\('categories', 60000\)/g, "await getCachedCollection('categories', 60000, res)");
code = code.replace(/await getCachedCollection\('custom_pages', 60000\)/g, "await getCachedCollection('custom_pages', 60000, res)");
code = code.replace(/await getCachedCollection\('purchases'\)/g, "await getCachedCollection('purchases', 20000, res)");
code = code.replace(/await getCachedCollection\('topups'\)/g, "await getCachedCollection('topups', 20000, res)");
code = code.replace(/await getCachedCollection\('users'\)/g, "await getCachedCollection('users', 20000, res)");

fs.writeFileSync('server.ts', code);
