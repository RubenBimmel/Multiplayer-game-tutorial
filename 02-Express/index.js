const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);

const port = 3000;

server.listen(port, function(){
  console.log(`listening on *:${port}`);
});

app.get('/', function (req, res) {
  res.sendFile('index.html', { root: __dirname })
});

app.use(express.static('public'));