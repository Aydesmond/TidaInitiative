// Tida

var modal = document.getElementById('popup-modal');
var btn = document.getElementById("open-popup-modal");
var span = document.getElementsByClassName("modal-close")[0];


btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


// Mba

var modalmba = document.getElementById('popup-modal-mba');
var btn = document.getElementById("open-popup-modal-mba");
var span = document.getElementsByClassName("modal-close-mba")[0];

btn.onclick = function() {
  modalmba.style.display = "block";
}

span.onclick = function() {
  modalmba.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modalmba) {
    modalmba.style.display = "none";
  }
}


// jai

var modaljai = document.getElementById('popup-modal-jai');
var btn = document.getElementById("open-popup-modal-jai");
var span = document.getElementsByClassName("modal-close-jai")[0];

btn.onclick = function() {
  modaljai.style.display = "block";
}

span.onclick = function() {
  modaljai.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modaljai) {
    modaljai.style.display = "none";
  }
}



// Desmond

var modaldes = document.getElementById('popup-modal-des');
var btn = document.getElementById("open-popup-modal-des");
var span = document.getElementsByClassName("modal-close-des")[0];

btn.onclick = function() {
  modaldes.style.display = "block";
}

span.onclick = function() {
  modaldes.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modaldes) {
    modaldes.style.display = "none";
  }
}



// Backup

// var modal = document.getElementById('popup-modal');
// var btn = document.getElementById("open-popup-modal");
// var span = document.getElementsByClassName("modal-close")[0];

// btn.onclick = function() {
//   modal.style.display = "block";
// }

// span.onclick = function() {
//   modal.style.display = "none";
// }

// window.onclick = function(event) {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// }

