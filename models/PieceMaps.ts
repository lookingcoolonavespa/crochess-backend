import { Schema, model } from 'mongoose';
import { PieceMapsInterface } from '../types/interfaces';

const PieceMapsSchema = new Schema<PieceMapsInterface>({
  game: { type: Schema.Types.ObjectId, ref: 'Game' },
  list: [
    {
      type: {
        white: {
          rook: { type: Array },
          knight: { type: Array },
          bishop: { type: Array },
          king: { type: Array },
          queen: { type: Array },
          pawn: { type: Array },
        },
        black: {
          rook: { type: Array },
          knight: { type: Array },
          bishop: { type: Array },
          king: { type: Array },
          queen: { type: Array },
          pawn: { type: Array },
        },
      },
    },
  ],
});

const PieceMaps = model<PieceMapsInterface>('PieceMaps', PieceMapsSchema);

export default PieceMaps;
