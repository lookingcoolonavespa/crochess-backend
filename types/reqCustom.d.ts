export interface GameCreateReq extends Request {
  player: string;
  time: number;
  increment: number;
}

export interface GameBeginReq extends Request {
  player: string;
  gameId: string;
  color: 'white' | 'black';
}
