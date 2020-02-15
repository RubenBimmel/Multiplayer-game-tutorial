var socket = io();

var playerPanel = document.getElementById("player-panel");
var players = {};

var gameUI = document.getElementById("state");

var rockValue = document.getElementById("rock-value");
var paperValue = document.getElementById("paper-value");
var scissorsValue = document.getElementById("scissors-value");

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

socket.on('reset', function(playerList) {
    playerList.forEach(p => {
        players[p.id].classList.remove('active', 'rock', 'paper', 'scissors');
        players[p.id].classList.toggle('lost', p.lost);
    });

    rockValue.innerText = paperValue.innerText = scissorsValue.innerText = "";
})

socket.on('result', function(result) {
    rockValue.innerText = result.rock;
    paperValue.innerText = result.paper;
    scissorsValue.innerText = result.scissors;

    result.players.forEach(p => {
        players[p.id].classList.add(p.hand);
    });
})

socket.on('winner', function(results) {
    results.forEach(p => players[p.id].classList.toggle('winner', !p.lost));
});