class Gamestate {
    constructor(id, room) {
        this.id = id;
        this.room = room;
        this.players = [];
        this.result = null;
        this.state = "lobby";
    }

    addHost(socket) {
        this.host = socket.id;

        socket.emit('id', this.id);
        socket.emit('state', this.state);
    }

    addPlayer(socket) {
        var player = {
            socket: socket.id,
            name: `Player ${this.players.length + 1}`,
            ready: false,
            hand: null,
            alive: true
        }

        this.players.push(player);

        socket.on('ready', (ready) => this.ready(player, ready));
        socket.on('hand', (hand) => this.setHand(player, hand));
        socket.on('disconnect', () => this.removePlayer(player));

        socket.emit('info', player);
        socket.emit('state', this.state);

        this.room.emit('addPlayer', player);
    }

    removePlayer(player) {
        var idx = this.players.findIndex(p => p.socket == player.socket);
        this.room.emit('removePlayer', player);
        this.players.splice(idx, 1);
    }

    ready (player, ready) {
        player.ready = ready

        if (this.players.length > 1) {
            var waiting = this.players.find(p => p.ready == false);
            if (!waiting) this.updateState();
        }
    }

    setHand (player, hand) {
        if (!player.alive) return;
        player.hand = hand;

        this.room.to(this.host).emit('active', player.socket);

        var waiting = this.players.find(p => p.alive && p.hand == null);
        if (!waiting) this.updateState();
    }

    updateState() {
        switch(this.state) {
            case "lobby":
                this.state = "choose";
                break;
            case "choose":
                this.result = {rock: 0, paper: 0, scissors: 0};
                this.players.forEach(p => {
                    if (p.hand == "rock") this.result.rock++;
                    else if (p.hand == "paper") this.result.paper++;
                    else if (p.hand == "scissors") this.result.scissors++;
                })

                this.room.to(this.host).emit('results', {sum: this.result, players: this.players});

                this.state = "result";
                setTimeout(() => this.updateState(), 2000) // auto update
                break;
            case "result":
                if (this.result.rock > this.result.paper && this.result.rock >= this.result.scissors) {
                    this.players.forEach(p => {
                        if (p.hand != "rock") p.alive = false;
                    });
                } else if (this.result.paper >= this.result.rock && this.result.paper > this.result.scissors) {
                    this.players.forEach(p => {
                        if (p.hand != "paper") p.alive = false;
                    });
                } else if (this.result.scissors > this.result.rock && this.result.scissors >= this.result.paper) {
                    this.players.forEach(p => {
                        if (p.hand != "scissors") p.alive = false;
                    });
                }

                var alive = 0;
                this.players.forEach(p => {
                    p.hand = null;
                    if (p.alive) alive++;
                })

                this.room.emit('resetHand');

                if (alive > 1) this.state = "choose";
                else {
                    this.state = "end";
                    setTimeout(() => this.updateState(), 2000) // auto update
                }
                break;
            case "end":
                this.players.forEach(p => {
                    p.ready = false;
                    p.hand = null;
                    p.alive = true;
                })
                this.state = "lobby";
                break;
        }

        this.room.emit('state', this.state);
    }
}

function rollDie() {
    return Math.ceil(Math.random() * 6);
}

module.exports = function(io) {
    return new Gamestate("1337", io);
}