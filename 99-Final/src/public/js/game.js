var socket = io();

var cups = document.getElementById("cups");

socket.on('players', function(players) {
    var html = "";
    players.forEach(player => {
        html += `<div class="cup">${player.dice.length}</div>`;
    });
    cups.innerHTML = html;
})