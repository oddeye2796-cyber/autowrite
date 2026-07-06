const https = require('https');

const data = JSON.stringify({
  base64: Buffer.from('hello world test').toString('base64'),
  filename: 'test.txt'
});

const options = {
  hostname: 'autowrite-ui.vercel.app',
  path: '/api/parse-file',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Response:', body.substring(0, 300));
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
