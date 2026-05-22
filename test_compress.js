const zlib = require('zlib');
const items = [];
for(let i=0; i<1112; i++) {
  // Simulating 3000-char string for each item
  items.push(Array(3000).fill('A').join(''));
}
const compressStock = (stockData) => {
  if (!Array.isArray(stockData) || stockData.length < 500) return stockData;
  return [{ __compressed: zlib.gzipSync(JSON.stringify(stockData)).toString('base64') }];
};
const compressed = compressStock(items);
console.log('Compressed array length:', compressed.length);
console.log('Base64 string length:', compressed[0].__compressed.length);
