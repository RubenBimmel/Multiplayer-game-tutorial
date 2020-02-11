var socket = io();

const currentBet = document.getElementById("current-bet");
const winnerName = document.getElementById("name");
const winnerDice = document.getElementById("dice").getElementsByTagName('img');
const playerPanel = document.getElementById("players");

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

    var money = document.createElement('p');
    money.classList = "money";
    money.innerText = p.money;
    player.appendChild(money);

    var bet = document.createElement('p');
    bet.classList = "bet";
    bet.innerText = p.bet;
    player.appendChild(bet);

    playerPanel.appendChild(player);

    players.push({id: p.socket, player: player, money: money, bet: bet});
});

socket.on('removePlayer', function(player) {
    var result = players.find(p => p.id = player.socket);
    playerPanel.removeChild(result);
});

socket.on('raise', function(value) {
    currentBet.innerText = value;
});

socket.on('bets', function(data) {
    console.log(data);
    data.forEach(player => {
        var result = players.find(p => p.id == player.socket);
        result.money.innerText = player.money;
        result.bet.innerText = player.bet;
    });
});

socket.on('winner', function(winner) {
    winnerName.innerText = winner.name;
    for (let i = 0; i < 5; i++) {
        if (i < winner.dice.length) winnerDice[i].src = `svg/dice${winner.dice[i]}.svg`;
        else winnerDice[i].src = `svg/nodice.svg`;
    }
});

socket.emit('host');