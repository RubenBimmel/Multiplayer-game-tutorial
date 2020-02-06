var socket = io();

const bidUI = document.getElementById("bid-ui");
const bidQuantity = document.getElementById("bid-quantity").getElementsByTagName("input")[0];
const bidFace = document.getElementById("bid-face").getElementsByTagName("img")[0];
const confirmButton = document.getElementById("confirm-button");
const diceImages = document.getElementById("dice").getElementsByTagName("img");

var quantity, face, playerID, state, currentBid;

function changeQuantity(value) {
    setQuantity(parseInt(bidQuantity.value) + parseInt(value));
}

function setQuantity(value) {
    if (state != "bidding") return;
    quantity = Math.max(currentBid.quantity, parseInt(value));
    bidQuantity.value = quantity;
    updateConfirmButton();
}

function changeFace(value) {
    setFace(face + parseInt(value));
}

function setFace(value) {
    if (state != "bidding") return;
    face = Math.max(currentBid.face, Math.min(6, parseInt(value)));
    bidFace.src = `svg/dice${face}.svg`;
    updateConfirmButton();
}

function challengeBid() {
    socket.emit('challenge');
}

function confirmBid() {
    socket.emit('raise', {quantity: quantity, face: face});
}

function disableBidUI() {
    bidUI.classList = 'disabled';
    bidQuantity.value = "";
    bidFace.src = "svg/nodice.svg";
}

function resetBidUI() {
    bidUI.classList = 'open';
    currentBid = {player: null, quantity: 1, face: 1};
    setQuantity(1);
    setFace(1);
}

function updateConfirmButton() {
    if (currentBid.player == null || quantity > currentBid.quantity || quantity >= currentBid.quantity && face > currentBid.face) {
        confirmButton.classList = 'enabled';
    } else {
        confirmButton.classList = 'disabled';
    }
}

socket.on('id', (id) => {
    playerID = id;
})

socket.on('dice', (dice) => {
    for (let i = 0; i < 10; i++) {
        if (i < dice.length) diceImages[i].src = `svg/dice${dice[i]}.svg`;
        else diceImages[i].src = `svg/nodice.svg`;
    }
})

socket.on('bid', (bid) => {
    currentBid = bid;
    bidUI.classList = bid.player == playerID ? 'active' : null;
    setQuantity(Math.max(quantity, bid.quantity));
    setFace(Math.max(face, bid.face));
});

socket.on('state', (value) => {
    state = value;

    switch(state) {
        case "bidding":
            resetBidUI();
            break;
        case "challenge":
            disableBidUI();
            break;
    }
});

socket.emit('join');