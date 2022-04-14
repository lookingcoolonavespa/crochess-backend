import { HydratedDocument } from 'mongoose';
import Game from '../models/Game';
import GameSeek from '../models/GameSeek';
import { getTime } from 'date-fns';
import { GameInterface } from '../types/interfaces';
import { Board, MiddleWare } from '../types/types';
import { io } from '../app';
import {
  convertFromMinutesToMs,
  formatTime,
  addTime,
} from '../utils/timeStuff';
import initGameboard from '../utils/initGameboard';
import { startingPositions } from 'crochess-api';
import getWhiteOrBlack from '../utils/getWhiteOrBlack';

export const createGame: MiddleWare = (req, res, next) => {
  const gameboard = initGameboard(startingPositions.standard);

  const seekerColor = getWhiteOrBlack();

  const game = new Game({
    white: {
      player: seekerColor === 'white' ? req.body.seeker : req.body.challenger,
      timeLeft: convertFromMinutesToMs(req.body.time),
    },
    black: {
      player: seekerColor === 'black' ? req.body.seeker : req.body.challenger,
      timeLeft: convertFromMinutesToMs(req.body.time),
    },
    board: gameboard.board,
    time: req.body.time,
    increment: req.body.increment,
    turn: 'white',
    turnStart: Date.now(),
  });

  game.save((err) => {
    if (err) return next(err);
  });

  io.of('games').to(req.body.seeker).emit('startGame', game._id);

  res.send(game._id.toString());

  req.body.gameId = game._id.toString();
  return next();
};

export const getGame: MiddleWare = async (req, res, next) => {
  if (req.params.gameId === 'undefined') return next();
  const game = await Game.findById(req.params.gameId);
  return res.send(game);
};

export const updateGame: MiddleWare = async (req, res) => {
  const game: HydratedDocument<GameInterface> | null = await Game.findById(
    req.body.gameId
  );
  if (!game) {
    return res.status(400).send('game not found');
  }

  const color = game.turn;
  const otherColor = color === 'white' ? 'black' : 'white';

  const timeSpent = Date.now() - game.turnStart;
  const base = game[color].timeLeft - timeSpent;

  game[color].timeLeft =
    base > 0 ? addTime(base, game.increment, 'seconds') : 0;
  console.log({
    color,
    timeSpent: formatTime(timeSpent),
    timeLeft: formatTime(game[color].timeLeft),
  });
  game.turnStart = Date.now();
  game.turn = otherColor;

  const updatedGame = await game.save();
  return res.json(updatedGame);
};
