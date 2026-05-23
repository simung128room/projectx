const forwardMap = { stockData: 'stockdata' };
const missingColumns = new Set(['products._version']);
function toDB(data, collection) {
  if (!data || typeof data !== 'object') return data;
  const res = {};
  const _data = { ...data };
  for (const k in _data) {
    let target = k;
    if (forwardMap[k]) target = forwardMap[k];
    else target = k.toLowerCase();

    if (collection && missingColumns.has(`${collection}.${target}`)) continue;
    res[target] = _data[k];
  }
  return res;
}
console.log(toDB({ stock: 25, stockData: "some data", _version: 1 }, 'products'));
