const http = require('http');
const options = {
  hostname: 'localhost',
  port: 8090,
  path: '/api/users',
  method: 'GET',
  headers: {
    'Accept': 'application/ld+json'
  }
};
const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, '\nBody:', data.substring(0, 500)));
});
req.end();
