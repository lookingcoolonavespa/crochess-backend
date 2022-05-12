import GameSeek from '../models/GameSeek';
import { MiddleWare } from '../types/types';

export const getGameSeeks: MiddleWare = async (req, res) => {
  const games = await GameSeek.find({});

  return res.json(games);
};

export const createGameSeek: MiddleWare = async (req, res, next) => {
  const seek = new GameSeek({
    color: req.body.color || 'random',
    time: req.body.time,
    increment: req.body.increment,
    seeker: req.body.seeker,
    gameType: req.body.gameType,
  });
  seek.save((err: unknown) => {
    if (err) return next(err);
  });

  return res.json(seek);
};

export const deleteGameSeek: MiddleWare = async (req, res) => {
  await GameSeek.findByIdAndDelete(req.params.id);

  return res.send();
};
