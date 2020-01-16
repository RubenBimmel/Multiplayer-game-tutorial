const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);

const port = 3000;

server.listen(port, function(){
  console.log(`listening on *:${port}`);
});

app.get('/', function (req, res) {
  res.sendFile('index.html', { root: __dirname + '/src' })
});

app.get('/game', function (req, res) {
  res.sendFile('game.html', { root: __dirname + '/src' })
});

app.get('/controller', function (req, res) {
  res.sendFile('controller.html', { root: __dirname + '/src' })
});

app.use(express.static('src/public'));