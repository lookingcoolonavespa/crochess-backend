import { Board, GameType } from './types';

interface Player {
  player: string;
  timeLeft: number;
}

export interface GameInterface {
  white: Player;
  black: Player;
  // board: Board;
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
