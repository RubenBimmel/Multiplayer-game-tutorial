var socket = io();

var name = sessionStorage.getItem("name");
var room = sessionStorage.getItem("room");

if (name && room) {
    socket.emit('join', {name: name, room: room});
} else {
    window.location.href = "/";
}

socket.on('joinFailed', () => {
    window.location.href = "/";
});