import axios from 'axios';

async function run() {
  try {
    const res = await axios.post('http://localhost:3000/api/redeem', { key: 'TEST-KEY-1234' }, {
      headers: {
        Authorization: `Bearer INVALID_TOKEN_FOR_TEST`
      }
    });
    console.log(res.data);
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
  }
}

run();
