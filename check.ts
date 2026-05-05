import axios from 'axios';
axios.get('http://127.0.0.1:3000/api/health')
  .then(res => console.log('HTTP', res.status, res.data))
  .catch(err => console.error(err.response ? err.response.status : err.message));
