import { Request, Response, NextFunction } from 'express';
import Game from '../models/Game';
import getWhiteOrBlack from '../utils/getWhiteOrBlack';

export async function createGame(
  req: Request,
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

export function beginGame(req: Request, res: Response, next: NextFunction) {
  Game.findByIdAndUpdate(
    req.gameId,
    {
      [req.color as string]: { player: req.player },
    },
    (err, game) => {
      if (err) return next(err);

      return res.json(game);
    }
  );
}
