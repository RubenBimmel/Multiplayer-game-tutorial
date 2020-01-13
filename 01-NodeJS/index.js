const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Hello World!');
});

const port = 3000;

server.listen(port, () => {
  console.log(`Server running at *:${port}`);
});