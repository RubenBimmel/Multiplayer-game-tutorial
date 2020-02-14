class Game {
    constructor(id) {
        this.id = id;
        this.players = [];
    }

    addHost(socket) {
        this.host = socket.id;
        socket.emit('room', this.id);
    }

    addPlayer(socket, name) {
        var player = {
            id: socket.id,
            name: name
        };
        this.players.push (player);
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

function removeRoom(id) {
    delete games[id];
}

module.exports = {
    createRoom: createRoom,
    removeRoom: removeRoom
}