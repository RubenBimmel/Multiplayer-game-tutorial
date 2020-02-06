class Gamestate {
    constructor(id, room) {
        this.id = id;
        this.room = room;
        this.players = [];
        this.removedPlayers = [];
        this.currentBid = null;
        this.state = "bidding";
    }

    addPlayer(socket) {
        var player = {
            id: this.players.length + this.removedPlayers.length,
            socket: this.socket,
            dice: [Math.ceil(Math.random() * 5), Math.ceil(Math.random() * 5), Math.ceil(Math.random() * 5), Math.ceil(Math.random() * 5), Math.ceil(Math.random() * 5)]
        }

        this.players.push(player);

        socket.on('raise', (bid) => this.raise(player.id, bid));
        socket.on('challenge', () => this.challenge(player.id));
        socket.on('disconnect', () => this.removePlayer(player.id));

        socket.emit('id', player.id);
        socket.emit('dice', player.dice);
        socket.emit('state', this.state);

        this.room.emit('players', this.players);
    }

    removePlayer(id) {
        var idx = this.players.indexOf(p => p.id === id);
        this.removedPlayers.push(this.players[idx]);
        this.players.splice(idx, 1);

        this.room.emit('players', this.players);
    }

    raise(playerID, bid) {
        if (this.state != "bidding" || bid == null) return;

        if (this.currentBid != null) {
            if (this.currentBid.face > bid.face) return;
            if (this.currentBid.face == bid.face && this.currentBid.quantity >= bid.quantity) return;
            if (this.currentBid.face < bid.face && this.currentBid.quantity > bid.quantity) return;
        }

        this.currentBid = bid;
        this.currentBid.player = playerID;

        this.room.emit('bid', this.currentBid);
    }

    challenge(playerID) {
        if (this.currentBid == null || this.currentBid.player == playerID) return;

        this.state = "challenge";
        this.room.emit('state', this.state);
    }
}

module.exports = function(io) {
    return new Gamestate("0000", io);
}