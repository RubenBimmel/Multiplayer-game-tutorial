var socket = io();

var nameInput = document.getElementById("name");
var roomInput = document.getElementById("room");

document.getElementById("join").onclick = () => {
    if (nameInput.value) {
        nameInput.style.border = "";
        socket.emit ('checkRoom', roomInput.value);
    } else {
        nameInput.style.border = "1px solid red";
    }
}

socket.on('roomExists', function(result) {
    if (result) {
        sessionStorage.setItem('name', nameInput.value);
        sessionStorage.setItem('room', roomInput.value);
        window.location.href = "controller";
    } else {
        roomInput.style.border = "1px solid red";
    }
});