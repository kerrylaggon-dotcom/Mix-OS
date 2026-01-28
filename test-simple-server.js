const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'OK', path: req.url }));
});

server.listen(5001, '127.0.0.1', () => {
  console.log('Simple server listening on port 5001');
});

// Test after 2 seconds
setTimeout(() => {
  const req = http.get('http://127.0.0.1:5001/test', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Response:', data);
      process.exit(0);
    });
  });
  req.on('error', (err) => {
    console.error('Request error:', err);
    process.exit(1);
  });
}, 2000);
