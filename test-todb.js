const missingColumns = new Set();
missingColumns.add('products._version');

const forwardMap = {
  productId: 'product_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  categoryId: 'category_id',
  orderId: 'order_id',
  oldStock: 'old_stock',
  newStock: 'new_stock',
  customPageId: 'custom_page_id',
  youtubeUrl: 'youtube_url',
  isDeleted: 'is_deleted',
  deletedAt: 'deleted_at',
  isHighlight: 'is_highlight',
  stockData: 'stockdata',
  userId: 'user_id',
  username: 'username'
};

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

console.log(toDB({ name: 'Test', _version: 1 }, 'products'));
