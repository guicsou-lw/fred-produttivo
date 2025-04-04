// makeRequest.js

const axios = require('axios');

const data = {
  email: 'admin@wemax',
  password: 'admin'
};

const url = 'https://wemaxapi-hmg.azurewebsites.net/api/login'; // Replace with your API URL

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Referer': 'https://wemax-jr4oa1t4v-lupit-io.vercel.app/',
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
};

axios.post(url, data, { headers, withCredentials: true }).then(response => {
  console.log('Response:', response.data);
}).catch(error => {
  console.error('Error:', error.response ? error.response.data : error.message);
});
