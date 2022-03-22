import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  white: {
    player: { type: String },
    timeUsed: { type: Number },
  },
  black: {
    player: { type: String },
    timeUsed: { type: Number },
  },
  board: { type: Map },
  scoreSheet: { type: Array },
  time: { type: Number },
  increment: { type: Number },
});

const Game = mongoose.model('Game', GameSchema);

export default Game;
