import axios from 'axios';
async function test() {
  const res = await axios.get('http://localhost:3000/api/health');
  console.log(res.data);
}
test();
