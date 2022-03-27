import { HydratedDocument } from 'mongoose';
import Game from '../models/Game';
import GameSeek from '../models/GameSeek';
import { getTime } from 'date-fns';
import { GameInterface } from '../types/interfaces';
import { Board, MiddleWare } from '../types/types';

export const getGameSeeks: MiddleWare = async (req, res) => {
  const games = await GameSeek.find({});

  return res.json(games);
};

export const createGameSeek: MiddleWare = async (req, res, next) => {
  const seek = new GameSeek({
    color: req.body.color || 'random',
    time: req.body.time,
    increment: req.body.increment,
  });
  seek.save((err: unknown) => {
    if (err) return next(err);
  });

  return res.json(seek);
};

export const beginGame: MiddleWare = (req, res, next) => {
  Game.findByIdAndUpdate(
    req.body.gameId,
    {
      [req.body.color as string]: { player: req.body.player },
    },
    (err, game) => {
      if (err) return next(err);

      return res.json(game);
    }
  );
};

export const updateGame: MiddleWare = async (req, res) => {
  const color = req.body.color as 'white' | 'black';
  const otherColor = req.body.color === 'white' ? 'black' : 'white';

  const currentTime = getTime(new Date());

  const game: HydratedDocument<GameInterface> | null = await Game.findById(
    req.body.gameId
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
  game.board = req.body.board as Board;

  const updatedGame = await game.save();

  return res.json(updatedGame);
};
