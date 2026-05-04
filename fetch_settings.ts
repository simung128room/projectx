import axios from 'axios';
async function test() {
  const res = await axios.get('http://localhost:3000/api/settings');
  console.log(res.data);
}
test();
