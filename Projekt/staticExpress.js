// Required pages.
var bot = require('./bot.js')
var express = require('express')
const path = require('path');
var app = express()

// Use of a static page.
app.use(express.static('public'))

// Use of a few static resoureces.
app.use('/css', express.static(__dirname + '/public/css'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use('/images', express.static(__dirname + '/public/images'))

// Send the page-contents to provide the content of the pages in a json and load them 
// from the script of the page.
app.get('/page-contents.json', function (req, res) {
  res.sendFile(path.join(__dirname, '/page-contents.json'));
});

// Send the message contents to make it available within the scripts of the pages.
app.get('/message-content.json', function (req, res) {
  res.sendFile(path.join(__dirname, '/message-content.json'));
});



// Start the express server
var webserver = app.listen(8081, function () {
  var address = webserver.address()
  console.log(address)
  console.log('Server started at http://localhost:8081')
})

// Import packets for websockets.
var WSS = require('websocket').server
var http = require('http')

var server = http.createServer()
server.listen(8181)

// Create the websocket server for the chat communication.
var wss = new WSS({
  httpServer: server,
  autoAcceptConnections: false
})

// Creates a new bot. The bot can not connect to the socket server yet, as it is not running yet.
var myBot = new bot()
var connections = {}

// If a client socket wants to connect to the server, it arrives here.
wss.on('request', function (request) {
  var connection = request.accept('chat', request.origin)

  connection.on('message', function (message) {
    var name = ''

    for (var key in connections) {
      if (connection === connections[key]) {
        name = key
      }
    }
    try {
      var data = JSON.parse(message.utf8Data)
    } catch (e) {
      console.log('Error parsing JSON');
      return;
    }
    var msg = 'leer'

    // Variables to save the last sentence and the sender.
    var uname
    var utype
    var umsg

    switch (data.type) {
      case 'join':
        // If the type is join, we add the client to our list.
        connections[data.name] = connection
        msg = '{"type": "join", "names": ["' + Object.keys(connections).join('","') + '"]}'
        if (myBot.connected === false) {
          myBot.connect()
        }

        break
      case 'msg':
        // Create a message in JSON with type, sender and content
        msg = '{"type": "msg", "name":"' + name + '", "msg":"' + data.msg + '","sender":"' + data.sender + '"}'
        utype = 'msg'
        uname = name
        umsg = data.msg
        break
    }

    // Send data to all connected sockets.
    for (var key in connections) {
      if (connections[key] && connections[key].send) {
        connections[key].send(msg)
      }
    }

    // Redirect user data to the bot so it can respond.
    if (uname !== 'MegaBot' && utype === 'msg') {
      myBot.post(msg)
    }
  })
})
