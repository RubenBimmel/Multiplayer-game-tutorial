var socket = io();

const rockButton = document.getElementById("rock");
const paperButton = document.getElementById("paper");
const scissorsButton = document.getElementById("scissors");

rockButton.onclick = function() {
    socket.emit('hand', "rock");
}

paperButton.onclick = function() {
    socket.emit('hand', "paper");
}

scissorsButton.onclick = function() {
    socket.emit('hand', "scissors");
}