require('dotenv').config();

let time = + new Date();

const MAGIC = {
    A: process.env.MAGIC_A || 1674590,
    B: process.env.MAGIC_B || 4372742,
    C: time,
}

const RNG = {
  seed: parseInt(time / 10, 10),

  setSeed(seed) {
    this.seed = seed;

    return this;
  },

  generate(start, end) {
    this.seed = (this.seed * MAGIC.A + MAGIC.B) % MAGIC.C;
    
    return Math.floor((this.seed / MAGIC.C) * (end - start + 1)) + start;
  }
}
  
module.exports = RNG;