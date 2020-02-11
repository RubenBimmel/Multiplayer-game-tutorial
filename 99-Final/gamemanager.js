class Gamestate {
    constructor(id, room) {
        this.id = id;
        this.room = room;
        this.players = [];
        this.currentBet = 0;
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
            dice: [],
            money: 2000,
            bet: 0,
            didFold: false
        }

        this.players.push(player);

        socket.on('ready', (ready) => this.ready(player, ready));
        socket.on('fold', () => this.fold(player));
        socket.on('call', () => this.call(player));
        socket.on('raise', () => this.raise(player));
        socket.on('disconnect', () => this.removePlayer(player));

        socket.emit('info', player);
        socket.emit('state', this.state);
        socket.emit('money', player.money);

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

    fold (player) {
        if (this.state != "betting") return;
        player.didFold = true;

        this.room.to(player.socket).emit('bet', {bet: player.bet, state: "fold"});

        this.updateBettingState();
    }

    call (player) {
        if (this.state != "betting" || player.didFold) return;
        player.bet = Math.min(this.currentBet, player.money);

        this.room.to(player.socket).emit('bet', {bet: player.bet, state: "call"});

        this.updateBettingState();
    }

    raise (player) {
        if (this.state != "betting" || player.didFold || player.money < this.currentBet) return;
        player.bet = Math.min(this.currentBet + 100, player.money);
        this.setCurrentBet(player.bet);

        this.updateBettingState();
    }

    setCurrentBet(value) {
        this.currentBet = value;
        this.room.to(this.host).emit('raise', value);

        this.players.forEach(p => {
            if (!p.didFold) {
                var call = p.bet == this.currentBet || p.bet == p.money;
                this.room.to(p.socket).emit('bet', {bet: p.bet, state: call ? "call" : ""});
            }
        })
    }

    updateBettingState() {
        this.room.to(this.host).emit('bets', this.players);

        var activePlayers = 0;
        var allInPlayers = 0;

        this.players.forEach(p => {
            if (!p.didFold) activePlayers++;
            if (p.bet == p.money) allInPlayers++;
        });

        if (activePlayers <= 1) {
            this.state = "fold";
            this.room.emit('state', this.state);
            setTimeout(() => this.updateState(), 2000);
            return;
        }

        if (allInPlayers >= activePlayers - 1) {
            this.state = "skip";
            this.room.emit('state', this.state);
            setTimeout(() => this.updateState(), 2000);
            return;
        }

        var waiting = this.players.find(p => p.bet != this.currentBet && p.bet != p.money && !p.fold);
        if (!waiting) {
            this.updateState();
            setTimeout(() => this.updateState(), 2000);
            return;
        }
    }

    updateState() {
        switch(this.state) {
            case "lobby":
                this.state = "start";
                setTimeout(() => this.updateState(), 2000);
                break;
            case "start":
                this.setCurrentBet(100);

                this.players.forEach(p => {
                    p.dice = [rollDie(), rollDie(), rollDie()];
                    this.room.to(p.socket).emit('dice', p.dice);
                    this.room.to(p.socket).emit('bet', {bet: 0, state: ""});
                });

                this.room.to(this.host).emit('winner', {name: "", dice: []});
                this.room.to(this.host).emit('bets', this.players);
                
                this.state = "betting";
                break;
            case "betting":
                this.state = this.players[0].dice.length < 5 ? "rolling" : "end";
                break;
            case "rolling":
                this.setCurrentBet(this.currentBet + 100);

                this.players.forEach(p => {
                    p.dice.push(rollDie());
                    this.room.to(p.socket).emit('dice', p.dice);
                });
                
                this.state = "betting";
                break;
            case "skip":
                this.players.forEach(p => {
                    for (let i = p.dice.length; i < 5; i++) {
                        p.dice.push(rollDie());
                    }
                    this.room.to(p.socket).emit('dice', p.dice);
                });

                this.state = "end";
                this.updateState();
                break;
            case "fold":
                var sum = 0;
                this.players.forEach(p => {
                    p.money -= p.bet;
                    sum += p.bet;
                });

                var winner = this.players.find(p => p.didFold == false);
                if (winner) winner.money += sum;

                this.reset();
                break;
            case "end":
                var winners = [];
                var score = 0;
                this.players.forEach(p => {
                    if (!p.didFold) {
                        var result = 0;
                        p.dice.forEach(d => result += d);
                        if (result > score) {
                            score = result;
                            winners = [p];
                        }
                        if (result == score) {
                            winners.push(p);
                        }
                    }
                });

                var sum = 0;
                this.players.forEach(p => {
                    p.money -= p.bet;
                    sum += p.bet;
                });

                winners.forEach(p => p.money += sum / winners.length);
                this.room.to(this.host).emit('winner', {name: winners[0].name, dice: winners[0].dice});

                this.reset();
                break;
        }

        this.room.emit('state', this.state);
    }

    reset() {
        this.players.forEach(p => {
            p.dice = [];
            p.bet = 0;
            p.didFold = false;
            this.room.to(p.socket).emit('money', p.money);
        });

        this.state = "start";
        setTimeout(() => this.updateState(), 4000);
    }
}

function rollDie() {
    return Math.ceil(Math.random() * 6);
}

module.exports = function(io) {
    return new Gamestate("1337", io);
}