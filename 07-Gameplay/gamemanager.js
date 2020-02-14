class Game {
    constructor(id) {
        this.id = id;
        this.players = [];
        this.state = "lobby";
    }

    addHost(socket) {
        this.host = socket.id;
        socket.emit('room', this.id);
        socket.join(this.id);
    }

    addPlayer(socket, name) {
        var player = {
            id: socket.id,
            name: name
        };
        this.players.push (player);
        socket.join(this.id);
        this.room.to(this.host).emit('addPlayer', player);

        socket.on('ready', (ready) => {
            player.ready = ready;
            this.room.to(this.host).emit('ready', player);

            if (this.players.length >= 2) {
                var unready = this.players.find(p => !p.ready);
                if (!unready) this.setState("betting");
            }
        });
    }

    setState(state) {
        this.state = state;
        this.room.emit('state', this.state);
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