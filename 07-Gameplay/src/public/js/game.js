var socket = io();

var playerPanel = document.getElementById("players");
var players = {};

var gameUI = document.getElementById("state");

socket.emit('host');

socket.on('room', function(id) {
    document.getElementById("room").innerText = id;
});

socket.on('addPlayer', function(p) {
    var player = document.createElement('div');
    player.classList = 'player';
    player.innerHTML = `<h2>${p.name}</h2>`;
    playerPanel.appendChild(player);
    players[p.id] = player;
});

socket.on('ready', function(p) {
    if (p.ready) players[p.id].classList.add('active');
    else players[p.id].classList.remove('active');
});

socket.on('state', function(state) {
    gameUI.classList = state;
})