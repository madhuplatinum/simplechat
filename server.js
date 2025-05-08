// server.js
const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(__dirname));

let activeCodes = new Set(); // valid game codes

app.get('/api/generate', (req, res) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  activeCodes.add(code);
  res.json({ code });
});

app.post('/api/join', (req, res) => {
  const { code } = req.body;
  if (activeCodes.has(code)) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('🧩 New user connected');

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('cellClicked', ({ room, row, col }) => {
    // Broadcast to others in the room
    socket.to(room).emit('cellClicked', { row, col });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
