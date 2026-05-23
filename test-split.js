let _selectFields = 'id, name, description, price, originalPrice, soldCount, imageUrl, stock, category, isPopular, image, isHighlight, customPageId, youtubeUrl, type, tag, _version';
const col = '_version';
_selectFields = _selectFields.split(',').filter(f => f.trim() !== col).join(',');
console.log(_selectFields);
