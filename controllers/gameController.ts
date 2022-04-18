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
import { startingPositions, Gameboard, files } from 'crochess-api';
import getWhiteOrBlack from '../utils/getWhiteOrBlack';
import { GameboardObj, PieceObj } from 'crochess-api/dist/types/interfaces';

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

  io.of('games').to(req.body.seeker).emit('startGame', {
    cookieId: req.body.seeker,
    gameId: game._id,
  });

  res.send({ cookieId: req.body.challenger, gameId: game._id.toString() });

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
  if (!game) return res.status(400).send('game not found');
  if (req.cookies.id !== game[game.turn].player)
    return res.status(409).send('not your turn');

  // validate move
  const { from, to, promote } = req.body;

  const gameboard: GameboardObj = Gameboard(
    game.board,
    game.checks,
    game.castle
  );
  const piece = gameboard.at(from).piece;
  if (!piece) return res.status(409).send('not valid move');
  if (piece.color !== game.turn) return res.status(409).send('not valid move');

  const newBoardState = gameboard.makeMove(from, to, promote);
  if (!newBoardState) return res.status(409).send('not valid move');
  const castleRights = gameboard.castling.getRightsAfterMove(to);
  const squaresGivingCheck = gameboard.get.squaresGivingCheckAfterMove(
    from,
    to
  );

  game.board = newBoardState;
  game.castle = castleRights;
  game.checks = squaresGivingCheck;

  // check if i need to toggle castling

  const color = game.turn;

  // deal with turn/timer
  const otherColor = color === 'white' ? 'black' : 'white';

  const timeSpent = Date.now() - game.turnStart;
  const base = game[color].timeLeft - timeSpent;

  game[color].timeLeft =
    base > 0 ? addTime(base, game.increment, 'seconds') : 0;
  game.turnStart = Date.now();
  game.turn = otherColor;

  const updatedGame = await game.save();
  return res.json(updatedGame);
};
