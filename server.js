// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, 'public')));


// Route for index.html
app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'public/index.html'));

});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
