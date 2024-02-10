// app.js
const express = require('express');
const db = require('./db'); // Import the db module

const app = express();
const PORT = 3001;

// Middleware for parsing JSON in requests
app.use(express.json());


// Routes and game logic remain mostly the same

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
