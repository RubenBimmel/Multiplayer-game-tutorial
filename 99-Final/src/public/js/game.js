var cups = document.getElementById("cups");

function addCup(dice) {
    cups.innerHTML += `<div class="cup">${dice}</div>`;
}