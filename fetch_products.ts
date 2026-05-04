import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/products');
    console.log("PRODUCTS:", res.data);
  } catch (err: any) {
    console.error("ERROR PRODUCTS:", err.response?.status, err.response?.data);
  }
}
test();
