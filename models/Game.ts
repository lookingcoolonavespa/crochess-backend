import { Schema, model } from 'mongoose';
import { GameInterface } from '../types/interfaces';

const GameSchema = new Schema<GameInterface>({
  white: {
    player: { type: String },
    timeLeft: { type: Date },
  },
  black: {
    player: { type: String },
    timeLeft: { type: Date },
  },
  // board: { type: Map },
  // scoreSheet: [{ type: String }],
  time: { type: Number },
  increment: { type: Number },
});

const Game = model<GameInterface>('Game', GameSchema);

export default Game;
