class Gamestate {
    constructor() {
        this.board = [];
        this.players = [];
        this.activePlayer = 0;
    }

    addPlayer(socket) {
        var id = this.players.length;
        this.players.push(socket);

        socket.emit('init', {id: id, board: this.board});

        socket.on('mark', (position) => this.mark(position, id));
    }

    mark(position, id) {
        this.board[position] = id;
        this.players[id].emit('marked', {position: position, id: id});
        this.players[id].broadcast.emit('marked', {position: position, id: id});
    }
}

module.exports = (io) => new Gamestate();