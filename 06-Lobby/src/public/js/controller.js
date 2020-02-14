var socket = io();

var name = sessionStorage.getItem("name");
var room = sessionStorage.getItem("room");

var readyButton = document.getElementById('ready');
var ready = false;

var gameUI = document.getElementById('state');

readyButton.onclick = function() {
    ready = !ready;
    readyButton.classList = ready ? 'ready' : '';
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