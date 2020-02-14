var socket = io();

var name = sessionStorage.getItem("name");
var room = sessionStorage.getItem("room");

var readyButton = document.getElementById('ready');
var ready = false;

var gameUI = document.getElementById('state');

var hand = document.getElementById("hand");

readyButton.onclick = function() {
    ready = !ready;
    readyButton.classList.toggle('ready', ready);
    socket.emit('ready', ready);
}

if (name && room) {
    socket.emit('join', {name: name, room: room});
} else {
    window.location.href = "/";
}

socket.on('joinFailed', () => {
    window.location.href = "/";
});

socket.on('state', function(state) {
    gameUI.classList = state;
})

document.getElementById("rock").onclick = () => choose("rock");
document.getElementById("paper").onclick = () => choose("paper");
document.getElementById("scissors").onclick = () => choose("scissors");

function choose(option) {
    hand.classList = option;
    socket.emit('hand', option);
}

socket.on('reset', function() {
    hand.classList.remove('active', 'rock', 'paper', 'scissors');
})