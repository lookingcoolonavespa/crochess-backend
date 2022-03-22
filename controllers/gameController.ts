import { Request, Response, NextFunction } from 'express';
import { HydratedDocument } from 'mongoose';
import Game from '../models/Game';
import getWhiteOrBlack from '../utils/getWhiteOrBlack';
import { getTime } from 'date-fns';
import { GameInterface } from '../types/interfaces';
import { Board } from '../types/types';

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

export async function updateGame(req: Request, res: Response) {
  const color = req.color as 'white' | 'black';
  const otherColor = req.color === 'white' ? 'black' : 'white';

  const currentTime = getTime(new Date());

  const game: HydratedDocument<GameInterface> | null = await Game.findById(
    req.gameId
  );
  if (!game) {
    return res.status(400).send('game not found');
  }
  const beginTime = game[color].turnStart || currentTime;
  const timeSpent = currentTime - beginTime;
  // if turnStart doesn't exist, that means it is first turn and you don't need to take time off

  game[color] = {
    ...game[color],
    turnStart: null,
    time: game[color].time || game.time - timeSpent + game.increment,
    // if game[color].time doesn't exist, initialize  with base time
  };
  game[otherColor] = {
    ...game[otherColor],
    turnStart: currentTime,
  };
  game.board = req.board as Board;

  const updatedGame = await game.save();

  return res.json(updatedGame);
}
