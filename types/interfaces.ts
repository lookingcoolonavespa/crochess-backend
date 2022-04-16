import { GameType } from './types';
import { Board, Square } from 'crochess-api/dist/types/types';
import { CastleObj } from 'crochess-api/dist/types/interfaces';

interface Player {
  player: string;
  timeLeft: number;
}

export interface GameInterface {
  white: Player;
  black: Player;
  board: Board;
  checks: Square[];
  castle: CastleObj;
  // scoreSheet: string[];
  time: number;
  increment: number;
  turn: 'white' | 'black';
  turnStart: number;
}

export interface GameSeekInterface {
  color: 'white' | 'black' | 'random';
  time: number;
  increment: number;
  seeker: string;
  gameType: GameType;
}
