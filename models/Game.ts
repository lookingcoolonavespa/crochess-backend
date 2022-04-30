import { Schema, model } from 'mongoose';
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
  checks: [{ type: String }],
  history: [[{ type: String }]],
  time: { type: Number },
  increment: { type: Number },
  turn: { type: String },
  turnStart: { type: Number },
  active: { type: Boolean },
  winner: { type: String },
  causeOfDeath: { type: String },
  pieceMaps: { type: Schema.Types.ObjectId, ref: 'PieceMaps' },
});

const Game = model<GameInterface>('Game', GameSchema);

export default Game;
