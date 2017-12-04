const express = require('express')
const path = require('path')
const request = require('request')
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/index', (req, res) => res.sendFile(path.join(__dirname, 'static/urlConverter.html')));
app.post('/convert', (req, res) => convert(req, res));

app.listen(3000, () => console.log('Listening on port 3000!'));

function getAccessToken() {
  const client_id = 'a301704db6d74757bdca35a03fdae35c';
  const client_secret = '03e5e5e518c24aaa81907bc8e1ec94de';
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };

  return new Promise((resolve, reject) => {
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        resolve(body.access_token);
      } else {
        reject(new Error(error));
      }
    });
  });
}

async function convert(req, res) {
  try {
    var accessToken = await getAccessToken();
  } catch (error) {
    console.log("there was an error" + error);
  }
  let track = req.body.track;
  let artist = req.body.artist;
  let encodedTrack = track.split(' ').join('+');
  let endpoint = "https://api.spotify.com/v1/search";
  let query = "?q=" + encodedTrack + "&type=track";
  let queryURL = endpoint + query;
  let options = {
    url: queryURL,
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    json: true
  };

  request.get(options, function(error, response, body) {
    let items = body.tracks.items;
    let link;
    for (var i = 0; i < items.length; i++)
    {
        var firstArtist = items[i].artists[0];
        let artistComparable = artist.toUpperCase();
        let firstArtistComparable = firstArtist.name.toUpperCase();
        if(artistComparable === firstArtistComparable) {
            link = items[i].external_urls.spotify.slice(0);
            break;
        }
    }
    let payload = '{"payload": "' + link + '"}';
    res.setHeader('Content-Type', 'application/json');
    res.send(payload);
  });
}