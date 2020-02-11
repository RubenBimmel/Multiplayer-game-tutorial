const playerPanel = document.getElementById("player-panel");
const rockValue = document.getElementById("rock-value");
const paperValue = document.getElementById("paper-value");
const scissorsValue = document.getElementById("scissors-value");

var socket = io();
var players = [];

socket.on('id', function(id) {
    document.getElementById("room").innerHTML = id;
});

socket.on('addPlayer', function(p) {
    var player = document.createElement('div');
    player.classList = 'player';
    
    var name = document.createElement('h2');
    name.innerText = p.name;
    player.appendChild(name);

    playerPanel.appendChild(player);

    players.push({id: p.socket, player: player});
});

socket.on('removePlayer', function(player) {
    var result = players.find(p => p.id == player.socket);
    playerPanel.removeChild(result.player);
});

socket.on('results', function(results) {
    rockValue.innerText = results.sum.rock;
    paperValue.innerText = results.sum.paper;
    scissorsValue.innerText = results.sum.scissors;

    results.players.forEach(player => {
        players.find(p => p.id == player.socket).player.classList.add(player.hand);
    });
});

socket.on('resetHand', function() {
    rockValue.innerText = paperValue.innerText = scissorsValue.innerText = "";
    players.forEach(p => {
        p.player.classList = 'player';
    })
});

socket.on('active', function(id) {
    players.find(p => p.id == id).player.classList.add('active');
})

socket.emit('host');