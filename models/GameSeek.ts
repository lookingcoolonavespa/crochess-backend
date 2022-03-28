import { Schema, model } from 'mongoose';
import { GameSeekInterface } from '../types/interfaces';

const GameSeekSchema = new Schema<GameSeekInterface>({
  color: { type: String, required: true },
  time: { type: Number, required: true },
  increment: { type: Number, required: true },
  seeker: { type: String, required: true },
  gameType: { type: String, required: true },
});

const GameSeek = model<GameSeekInterface>('GameSeek', GameSeekSchema);

export default GameSeek;
