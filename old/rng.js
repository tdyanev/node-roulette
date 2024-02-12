require('dotenv').config();

const MAGIC = {
    A: process.env.MAGIC_A || 1674590,
    B: process.env.MAGIC_B || 4372742,
    C: + new Date(),
}

class RNG {
  constructor(seed = 1) {
    this.seed = seed;
  }

  setSeed(seed) {
    this.seed = seed;
  }

  generate(start, end) {
    this.seed = (this.seed * MAGIC.A + MAGIC.B) % MAGIC.C;
    return Math.floor((this.seed / MAGIC.C) * (end - start + 1)) + start;
  }
}
  
module.exports = RNG;