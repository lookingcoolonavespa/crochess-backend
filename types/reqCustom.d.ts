// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express';
import { WebSocketServer } from 'ws';
import { Board } from './types';

declare global {
  namespace Express {
    export interface Request {
      player?: string;
      time?: number;
      increment?: number;
      gameId?: string;
      color?: 'white' | 'black';
      board?: Board;
    }
  }
}
