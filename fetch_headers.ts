import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/stats');
    console.log("HEADERS:", res.headers);
    console.log("STATS:", res.data);
  } catch (err: any) {
    console.error("ERROR TEST HEADERS:", err.response?.headers);
    console.error("ERROR TEST:", err.response?.status, err.response?.data);
  }
}
test();
