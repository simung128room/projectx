import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/stats');
    console.log("STATS:", res.data);
  } catch (err: any) {
    console.error("ERROR TEST:", err.response?.status, err.response?.data);
  }
}
test();
