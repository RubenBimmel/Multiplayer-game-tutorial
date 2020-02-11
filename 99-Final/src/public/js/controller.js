const readyButton = document.getElementById("ready");
const rockButton = document.getElementById("rock");
const paperButton = document.getElementById("paper");
const scissorsButton = document.getElementById("scissors");

var socket = io();
var ready = false;
var hand, state;

readyButton.onclick = function() {
    ready = !ready;
    socket.emit('ready', ready);
    readyButton.classList = ready ? 'ready' : null;
}

rockButton.onclick = function() {
    if (state != 'choose') return;
    hand = "rock";
    rockButton.classList = 'selected';
    paperButton.classList = scissorsButton.classList = 'none';
    socket.emit('hand', "rock");
}

paperButton.onclick = function() {
    if (state != 'choose') return;
    hand = "paper";
    paperButton.classList = 'selected';
    rockButton.classList = scissorsButton.classList = 'none';
    socket.emit('hand', "paper");
}

scissorsButton.onclick = function() {
    if (state != 'choose') return;
    hand = "scissors";
    scissorsButton.classList = 'selected';
    rockButton.classList = paperButton.classList = 'none';
    socket.emit('hand', "scissors");
}

socket.on('state', function(s) {
    state = s;

    if (state == "lobby") {
        readyButton.style.display = 'block';
        readyButton.classList = null;
        ready = false;
    } else {
        readyButton.style.display = 'none';
    }
});

socket.on('resetHand', function() {
    hand = null;
    rockButton.classList = paperButton.classList = scissorsButton.classList = 'none';
});

socket.emit('join');