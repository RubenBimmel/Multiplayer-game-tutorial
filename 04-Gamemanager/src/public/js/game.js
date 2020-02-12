var socket = io();

socket.emit('host');

socket.on('room', function(id) {
    document.getElementById("room").innerText = id;
});