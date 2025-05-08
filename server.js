const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());

let activeCodes = new Set(); // temporarily store active game codes

// API to generate a code
app.get('/api/generate', (req, res) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  activeCodes.add(code);
  res.json({ code });
});

// API to join a code
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
