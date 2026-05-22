const zlib = require('zlib');

const compressStock = (stockData) => {
  if (!Array.isArray(stockData) || stockData.length < 500) return stockData;
  return [{ __compressed: zlib.gzipSync(JSON.stringify(stockData)).toString('base64') }];
};

const decompressStock = (data) => {
  let compData = data;
  if (Array.isArray(data) && data.length === 1 && data[0] && typeof data[0] === 'object' && data[0].__compressed) {
    compData = data[0];
  }
  if (compData && typeof compData === 'object' && compData.__compressed) {
    try {
      return JSON.parse(zlib.gunzipSync(Buffer.from(compData.__compressed, 'base64')).toString('utf-8'));
    } catch(e) { 
        console.error("decompressStock error:", e);
        return []; 
    }
  }
  return data;
};

const items = [];
for(let i=0; i<1112; i++) {
  // Simulating 3000-char string for each item
  items.push(Array(3000).fill('A').join(''));
}

const compressed = compressStock(items);
console.log('Compressed array length:', compressed.length);
console.log('Base64 string length:', compressed[0].__compressed.length);
const decompressed = decompressStock([{ __compressed: compressed[0].__compressed }]);
console.log('Decompressed array length:', decompressed.length);
