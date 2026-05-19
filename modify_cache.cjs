const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /const getCachedCollection = async \(collectionName: string, ttl: number = 20000\) => \{/,
  `const getCachedCollection = async (collectionName: string, ttl: number = 20000, res?: any) => {`
);

code = code.replace(
  /if \(firestoreCache\[collectionName\] && now - firestoreCache\[collectionName\].timestamp < ttl\) \{[\s\S]*?return firestoreCache\[collectionName\].data;[\s\S]*?\}/,
  `if (firestoreCache[collectionName] && now - firestoreCache[collectionName].timestamp < ttl) {
      if (res) res.setHeader('X-Cache', 'HIT');
      return firestoreCache[collectionName].data;
    }
    if (res) res.setHeader('X-Cache', 'MISS');`
);

fs.writeFileSync('server.ts', code);
