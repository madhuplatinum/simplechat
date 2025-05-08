const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

// Store rooms and connections
const rooms = {};  // { roomCode: Set of clients }

wss.on('connection', (ws) => {
  let currentRoom = null;

  ws.on('message', (message) => {
    const parsed = JSON.parse(message);

    // Join Room
    if (parsed.type === 'join') {
      currentRoom = parsed.room;
      if (!rooms[currentRoom]) {
        rooms[currentRoom] = new Set();
      }
      rooms[currentRoom].add(ws);
    }

    // Broadcast message
    if (parsed.type === 'message' && currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          const isSender = client === ws;
          client.send(JSON.stringify({
            sender: isSender ? "Me" : "Other",
            text: parsed.text
          }));
        }
      });
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].delete(ws);
      if (rooms[currentRoom].size === 0) {
        delete rooms[currentRoom];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
