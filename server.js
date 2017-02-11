// server.js
/*jshint esversion: 6 */
const express = require('express');
const SocketServer = require('ws').Server;
const uuid = require('node-uuid');
const WebSocket = require('ws');

// Set the port to 4000
const PORT = 4000;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });
let socketCount = 0;
// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.

function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {

      if(data.type === "postNotification"){
        data.type = "incomingNotification";
      }
      if(data.type === "postMessage"){
        data.type = "incomingMessage";
      }

      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  socketCount +=  WebSocket.OPEN;
  const userCount = socketCount;

  console.log('Client connected', userCount);

  const COLORS = [
    "red", "maroon", "blue", "green",
    "lime", "aqua", "", "cornflowerblue",
    "darkcyan", "deeppink", "lightseagreen", "royalblue"
    ];

  function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }
  const color = getRandomColor();

  broadcast({type: "counter", countLogin: socketCount});
  ws.send(JSON.stringify({ type: "change_color", color: color }));

  ws.on('message', function incoming(message){
    const messageJson = JSON.parse(message);
    messageJson.id = uuid.v1();

    broadcast(messageJson);

    console.log('received: %s', JSON.stringify(messageJson));
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    socketCount -= 1;
    broadcast({type: "counter", countLogin: socketCount});
    console.log('Client disconnected');
  });
});