require('dotenv').config();
const { fetchProducts } = require('./src/lib/admindb'); 
// wait, I don't need the whole server, I can just make a fetch directly to localhost:3000
