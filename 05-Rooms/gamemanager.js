class Game {
    constructor(id) {
        this.id = id;
        this.players = [];
    }

    addHost(socket) {
        this.host = socket.id;
        socket.emit('room', this.id);
        socket.join(this.id);
    }

    addPlayer(socket, name) {
        this.players.push ({
            id: socket.id,
            name: name
        })
        socket.join(this.id);
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

function roomExists(id) {
    return games[id] != undefined;
}

function joinRoom(room, socket, name) {
    games[room].addPlayer(socket, name);
}

module.exports = {
    createRoom: createRoom,
    removeRoom: removeRoom,
    roomExists: roomExists,
    joinRoom: joinRoom
}