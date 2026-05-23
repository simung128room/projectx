require('dotenv').config();
async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/products/1/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.VITE_ADMIN_PASSWORD },
      body: JSON.stringify({ newItems: [{ code: '123' }] })
    });
    console.log(res.status);
    console.log(await res.text());
  } catch(e) { console.error(e) }
}
run();
