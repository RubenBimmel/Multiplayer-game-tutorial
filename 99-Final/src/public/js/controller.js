var socket = io();

const readyButton = document.getElementById("ready-button");
const readyPanel = document.getElementById("ready-panel");
const gamePanel = document.getElementById("game-panel");
const money = document.getElementById("money");
const bet = document.getElementById("bet");
const diceImages = document.getElementById("dice").getElementsByTagName("img");

var ready = false;

function setReady() {
    ready = !ready;
    socket.emit('ready', ready);
    readyButton.classList = ready ? 'ready' : null;
}

function fold() {
    socket.emit('fold');
}

function call() {
    socket.emit('call');
}

function raise() {
    socket.emit('raise');
}

socket.on('info', (p) => {
    playerID = p.id;
    document.getElementById("player-name").innerText = p.name;
})

socket.on('dice', (dice) => {
    for (let i = 0; i < 5; i++) {
        if (i < dice.length) diceImages[i].src = `svg/dice${dice[i]}.svg`;
        else diceImages[i].src = `svg/nodice.svg`;
    }
})

socket.on('state', function(state) {
    readyPanel.style.display = state == "lobby" ? "block" : "none";
    gamePanel.style.display = state == "lobby" ? "none" : "block";
});

socket.on('money', function(m) {
    money.innerText = `$ ${m}`;
});

socket.on('bet', function(b) {
    bet.innerText = `$ ${b.bet}`;
    bet.classList = b.state;
});

socket.emit('join');