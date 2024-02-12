require('dotenv').config();

const rng = require('./rng2');

const UNKNOWN_STATE = 'UNKNOWN';

const STATES = {
  [UNKNOWN_STATE]: -1,
  BETTING: 0,
  NO_MORE_BETS: 1,
  DRAWING_START: 2,
  DRAWING_FINISH: 3,
  SETTLEMENT: 4,
};

const DEFAULT_CONFIG = {
  bettingRoundDuration: process.env.BETTING_ROUND_DURATION || 20,
  drawingDuration: process.env.DRAWING_DURATION || 5
};

class Roulette {
  constructor(config) {
    this.winningNumber = -1;
    this.state = STATES.UNKNOWN;

    this.config = {
      ...DEFAULT_CONFIG, ...config
    };

    this.bettingRoundDurationInMs = this.config.bettingRoundDuration * 1000;

    this.onNoMoreBets = this.onStateChange = function () {};
  }

  startNewRound() {
    this.roundStartAt = + new Date();
    this.roundFinishAt = this.roundStartAt + this.bettingRoundDurationInMs;

    this.timer = setTimeout(() => {
      this.handleNoMoreBets();
    }, this.bettingRoundDurationInMs);


    console.log('started new round which will last', this.bettingRoundDurationInMs)

    this.state = STATES.BETTING;
    this.onStateChange.call(this);
  }

  getLastWinningNumber() {
    return this.winningNumber;
  }

  getRemainingTime() {
    return this.roundFinishAt - new Date().getTime();
  }

  getState() {
    for (let key in STATES) {
      if (STATES[key] === this.state) {
        return key;
      }
    }
    
    return UNKNOWN_STATE;
  }

  setWinningNumber(number) {
    this.winningNumber = number;
  }

  handleNoMoreBets() {
    this.state = STATES.NO_MORE_BETS;
    this.onStateChange.call(this);

    setTimeout(() => this.handleDrawing(), this.config.drawingDuration * 1000);
  }

  handleDrawing() {
    this.state = STATES.DRAWING_START;
    this.onStateChange.call(this);

    this.winningNumber = rng.generate(0, 36);

    this.state = STATES.DRAWING_FINISH;
    this.onStateChange.call(this);

    setTimeout(() => this.handleSettlement(), this.config.drawingDuration * 1000);
  }

  handleSettlement() {
    this.state = STATES.SETTLEMENT;
    this.onStateChange.call(this);
  }
}
  
module.exports = Roulette;