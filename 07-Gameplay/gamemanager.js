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
            name: name,
            lost: false
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

        socket.on('hand', (hand) => {
            if (player.lost) return;

            player.hand = hand;
            this.room.to(this.host).emit('ready', player);

            var unready = this.players.find(p => !p.hand && !p.lost);
            if (!unready) this.setState("resolving");
        });
    }

    setState(state) {
        this.state = state;
        this.room.emit('state', this.state);

        switch(state) {
            case "betting":
                this.room.emit('reset', this.players);
                break;
            case "resolving":
                var result = {rock: 0, paper: 0, scissors: 0, players: this.players};
                this.players.forEach(p => {
                    if (p.hand == "rock") result.rock ++;
                    else if (p.hand == "paper") result.paper ++;
                    else if (p.hand == "scissors") result.scissors ++;
                });
                this.room.to(this.host).emit('result', result);

                var winner;
                if (result.rock > result.paper && result.rock >= result.scissors) winner = "rock";
                if (result.paper > result.scissors && result.paper >= result.rock) winner = "paper";
                if (result.scissors > result.rock && result.scissors >= result.paper) winner = "scissors";

                if (winner) {
                    this.players.forEach(p => {
                        if (p.hand != winner) p.lost = true;
                    })
                }

                setTimeout(() => this.reset(), 3000);
                break;
        }
    }

    reset() {
        this.players.forEach(p => p.hand = null);
        if (this.players.filter(p => !p.lost).length == 1) {
            this.room.to(this.host).emit('winner', this.players);
            this.players.forEach(p => p.lost = false);
        }
        this.setState("betting");
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