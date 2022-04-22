import mongoose, { Schema, model } from 'mongoose';
import { GameInterface } from '../types/interfaces';

const GameSchema = new Schema<GameInterface>({
  white: {
    player: { type: String },
    timeLeft: { type: Number },
  },
  black: {
    player: { type: String },
    timeLeft: { type: Number },
  },
  board: { type: Map },
  history: [[{ type: String }]],
  time: { type: Number },
  increment: { type: Number },
  turn: { type: String },
  turnStart: { type: Number },
});

const Game = model<GameInterface>('Game', GameSchema);

export default Game;
