import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  white: {
    player: { type: String, required: true },
    time: { type: Number, required: true },
    required: true,
  },
  black: {
    player: { type: String, required: true },
    time: { type: Number, required: true },
    required: true,
  },
  board: { type: Map, required: true },
  scoreSheet: { type: Array },
  clock: { type: Date, required: true },
});

const Game = mongoose.model('Game', GameSchema);

export default Game;
