const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);

var io = require('socket.io').listen(server);
var gamemanager = require('./gamemanager.js')(io);

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

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('join', function() {
    gamemanager.addPlayer(socket);
  });
});