require('dotenv').config();

const express = require('express');
const http = require('http');
const db = require('./db');
const { Server } = require('socket.io');
const path = require('path');
const rng = require('./rng2');
const Roulette = require('./roulette');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

const game = new Roulette({
  bettingRoundDuration: 15,
  drawingDuration: 3,
});

let balanceQueue = [];
let interval;

game.onStateChange = function() {

  switch (this.getState()) {
    case 'SETTLEMENT':
      handleBalanceQueue();
      setTimeout(() => game.startNewRound(), 5000);

      break;

    case 'BETTING':
      io.emit('newBettingRound');

      interval = setInterval(() => {
        io.emit('updateRoundTime', {
          time: parseInt(game.getRemainingTime() / 1000, 10)
        });
      }, 1000);

      break;

    case 'NO_MORE_BETS':
      io.emit('noMoreBets');

      clearInterval(interval);

      break;

    case 'DRAWING_FINISH':
      handleDrawingFinish();

      break;
  }

}

function handleBalanceQueue() {
  balanceQueue.forEach(item => {
    item.socket.emit('updateBalance', item.balance);
  })

  balanceQueue = [];
}

function handleDrawingFinish() {
  let winningNumber = game.getLastWinningNumber();

  io.emit('winningNumber', {
    message: `The winning number is ${winningNumber}. Please wait while we handle your bets...`,
    winningNumber: winningNumber,
  });
}

app.use(express.json());

io.on('connection', (socket) => {

  socket.on('newPlayer', async () => {
    socket.emit('updateUserData', await createUser());
  });

  socket.on('sendBets', (data) => {
    let totalWinnings = 0;

    data.bets.forEach((bet, index) => {
      if (index === game.getLastWinningNumber()) {
        totalWinnings += bet * 36;
      }
    });
    
    const balance = data.balance - data.bets.reduce((total, bet) => total + bet, 0) + totalWinnings;
  
    // Send back player's balance in settlement state

    balanceQueue.push({
      socket,
      balance,
    });

    // Normally I'd update the db but since every reload creates a new user there's no point

  })

});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));

});

async function createUser() {
  try {
    // Generate a random username
    const username = `user${Date.now()}_${rng.generate(1, 1000)}`;

    await db.execute('INSERT INTO players (username, balance) VALUES (?, ?)', [username, rng.generate(100, 1000)]);

    return getUserByName(username);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}


async function getUserByName(username) {
  const [user] = await db.query(
    'SELECT username, balance FROM players WHERE username = ? LIMIT 1', [username]);

  return user.length > 0 ? user[0] : null;
}

app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => {
  // start the game as soon as the server is running
  
  game.startNewRound();
});
