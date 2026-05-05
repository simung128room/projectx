import axios from 'axios';

async function run() {
  try {
    const res = await axios.get('https://ais-pre-yqcwrqpfmcv3f3k4u45xxa-109803326919.asia-east1.run.app/api/health'); 
    console.log(res.status, res.data);
  } catch (e: any) {
    if (e.response) {
       console.log('Error Code:', e.response.status, 'Body:', e.response.data);
    } else {
       console.log('Error:', e.message);
    }
  }
}
run();
