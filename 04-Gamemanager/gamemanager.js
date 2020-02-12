class Game {
    constructor(id) {
        this.id = id;
        this.players = [];
    }

    addPlayer(socket) {
        this.players.push(socket.id);
    }
}

var games = {};

function createRoom() {
    var id;
    do { 
        id = `0000${Math.floor(Math.random() * 10000)}`.slice(-4);
    } while (games[id] != undefined);
    
    games[id] = new Game(id);
    return games[id];
}

function removeGame(id) {
    delete games[id];
}

module.exports = {
    createRoom: createRoom,
    removeGame: removeGame
}