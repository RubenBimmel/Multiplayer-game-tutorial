var socket = io();

function mark(position) {
    console.log(position);
    socket.emit('mark', position);
}