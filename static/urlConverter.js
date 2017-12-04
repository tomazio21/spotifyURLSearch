var convertButton;
var url;
window.onload = function() {
    convertButton = document.getElementById("convert");
    convertButton.addEventListener("click", convert);
    url = document.getElementById("url");
    url.addEventListener("click", function() {
        url.select();
    })
}

function convert() {
    var track = document.getElementById('track').value;
    var artist = document.getElementById('artist').value;
    var payload = {
        track: track,
        artist: artist
    };
    var header = new Headers();
    header.append("Content-Type", "application/json");
    fetch('/convert', {
        method: 'POST',
        headers : header,
        body : JSON.stringify(payload)
    })
    .then(response => response.json())
    .then((data) => {
        document.getElementById('url').value = data.payload;
    })
    .catch(error => {
      console.error(error);
    });
}