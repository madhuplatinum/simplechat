const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  let contentType = 'text/html';

  if (filePath.endsWith('.js')) contentType = 'text/javascript';
  else if (filePath.endsWith('.css')) contentType = 'text/css';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const wss = new WebSocket.Server({ server });
let rooms = {};

wss.on('connection', (ws) => {
  let room = null;

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.join) {
      room = data.join;
      rooms[room] = rooms[room] || [];
      rooms[room].push(ws);
    } else if (data.text && room && rooms[room]) {
      rooms[room].forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data.text);
        }
      });
    }
  });

  ws.on('close', () => {
    if (room && rooms[room]) {
      rooms[room] = rooms[room].filter(client => client !== ws);
    }
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
