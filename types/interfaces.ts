import { Board } from './types';

interface Player {
  player: string;
  time: number;
  turnStart: number | null;
}

export interface GameInterface {
  white: Player;
  black: Player;
  board: Board;
  scoreSheet: string[];
  time: number;
  increment: number;
}
