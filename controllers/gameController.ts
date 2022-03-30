import { HydratedDocument } from 'mongoose';
import Game from '../models/Game';
import GameSeek from '../models/GameSeek';
import { getTime } from 'date-fns';
import { GameInterface } from '../types/interfaces';
import { Board, MiddleWare } from '../types/types';
import { io } from '../app';

export const createGame: MiddleWare = (req, res, next) => {
  const game = new Game({
    white: {
      player: req.body.white,
      time: req.body.time,
    },
    black: {
      player: req.body.black,
      time: req.body.time,
    },
    time: req.body.time,
    increment: req.body.increment,
  });

  game.save((err) => {
    if (err) return next(err);
  });

  io.of('games').to(req.body.seeker).emit('startGame', game._id);

  res.send(game._id);

  req.body.gameId = game._id.toString();
  return next();
};

export const joinGameRoom: MiddleWare = (req, res, next) => {
  if (!req.body.gameId) return next();

  const seekerSocket = io.of('games').sockets.get(req.body.seeker);
  const challengerSocket = io.of('games').sockets.get(req.body.challenger);

  seekerSocket?.join(req.body.gameId);
  challengerSocket?.join(req.body.gameId);
};

// export const updateGame: MiddleWare = async (req, res) => {
//   const color = req.body.color as 'white' | 'black';
//   const otherColor = req.body.color === 'white' ? 'black' : 'white';

//   const currentTime = getTime(new Date());

//   const game: HydratedDocument<GameInterface> | null = await Game.findById(
//     req.body.gameId
//   );
//   if (!game) {
//     return res.status(400).send('game not found');
//   }
//   const beginTime = game[color].turnStart || currentTime;
//   const timeSpent = currentTime - beginTime;
//   // if turnStart doesn't exist, that means it is first turn and you don't need to take time off

//   game[color] = {
//     ...game[color],
//     turnStart: null,
//     time: game[color].time || game.time - timeSpent + game.increment,
//     // if game[color].time doesn't exist, initialize  with base time
//   };
//   game[otherColor] = {
//     ...game[otherColor],
//     turnStart: currentTime,
//   };
//   game.board = req.body.board as Board;

//   const updatedGame = await game.save();

//   return res.json(updatedGame);
// };
