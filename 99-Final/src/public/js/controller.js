var socket = io();
var face = 1;

const bidQuantity = document.getElementById("bid-quantity").getElementsByTagName("input")[0];
const bidFace = document.getElementById("bid-face").getElementsByTagName("img")[0];

function changeQuantity(value) {
    setQuantity(parseInt(bidQuantity.value) + parseInt(value));
}

function setQuantity(value) {
    bidQuantity.value = Math.max(parseInt(value), 0);
}

function changeFace(value) {
    face = Math.max(1, Math.min(6, face + parseInt(value)));
    bidFace.src = `svg/dice${face}.svg`;
}

function challengeBid() {

}

function confirmBid() {
    
}