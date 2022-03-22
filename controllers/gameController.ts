import { Response, NextFunction } from 'express';
import { GameCreateReq, GameBeginReq } from '../types/reqCustom';
import Game from '../models/Game';
import getWhiteOrBlack from '../utils/getWhiteOrBlack';

export async function createGame(
  req: GameCreateReq,
  res: Response,
  next: NextFunction
) {
  const color = getWhiteOrBlack();
  const game = new Game({
    [color]: { player: req.player },
    time: req.time,
    increment: req.increment,
  });

  await game.save((err: unknown) => {
    if (err) return next(err);
  });

  return res.json(game);
}

export function beginGame(
  req: GameBeginReq,
  res: Response,
  next: NextFunction
) {
  Game.findByIdAndUpdate(
    req.gameId,
    {
      [req.color]: { player: req.player },
    },
    (err, game) => {
      if (err) return next(err);

      return res.json(game);
    }
  );
}
