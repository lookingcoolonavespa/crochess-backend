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

  // validate move
  const { from, to } = req.body;

  const gameboard: GameboardObj = Gameboard(
    game?.board,
    game.checks,
    game.castle
  );
  const legalMoves = gameboard.at(from).getLegalMoves();
  if (!legalMoves.includes(to)) return res.send('not a valid move');

  // check if i need to toggle castling
  const piece = gameboard.at(from).piece as PieceObj;
  if (game.castle[piece.color].kingside || game.castle[piece.color].queenside) {
    // check if i need to change castling rights
    if (piece.type === 'king') {
      game.castle[piece.color].kingside = false;
      game.castle[piece.color].queenside = false;
    }

    if (piece.type === 'rook') {
      // need to find if it is kingside or queenside rook
      const [file] = from.split('');
      const kingside = files.indexOf(file) > 3;
      if (kingside) game.castle[piece.color].kingside = false;
      else game.castle[piece.color].queenside = false;
    }
  }

  // check if move is castle
  const color = game.turn;
  let castleSide: '' | 'queenside' | 'kingside' = '';

  if (piece.type === 'king') {
    const castleSquares = gameboard.get.castleSquares(game.turn);

    for (const [side, squares] of Object.entries(castleSquares)) {
      if (squares[1] === to) castleSide = side as 'kingside' | 'queenside';
    }
  }

  if (castleSide) gameboard.castle(color, castleSide);
  else gameboard.from(from).to(to);
  // deal with turn/timer
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
