import { HydratedDocument } from 'mongoose';
import Game from '../models/Game';
import { GameInterface } from '../types/interfaces';
import { MiddleWare } from '../types/types';
import { io } from '../app';
import { convertFromMinutesToMs, addTime } from '../utils/timeStuff';
import initGameboard from '../utils/initGameboard';
import { startingPositions, Gameboard, History } from 'crochess-api';
import getWhiteOrBlack from '../utils/getWhiteOrBlack';
import { GameboardObj } from 'crochess-api/dist/types/interfaces';

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
    active: true,
  });

  game.save((err) => {
    if (err) return next(err);
  });

  io.of('games').to(req.body.seeker).emit('startGame', {
    cookieId: req.body.seeker,
    gameId: game._id,
    color: seekerColor,
  });

  res.send({
    cookieId: req.body.challenger,
    gameId: game._id.toString(),
    color: seekerColor === 'white' ? 'black' : 'white',
  });

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

  if (
    // checking id of cookie against playerId
    // the id of player looks like 'gameId(color)'
    req.cookies[`${req.body.gameId}(${game.turn})`] !== game[game.turn].player
  )
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
  const castleRights = gameboard.get.castleRightsAfterMove(to);

  const squaresGivingCheck = gameboard.get.squaresGivingCheckAfterMove(
    from,
    to
  );
  const color = game.turn;
  const otherColor = color === 'white' ? 'black' : 'white';
  const checkmate =
    squaresGivingCheck.length > 0 &&
    gameboard.get.isCheckmate(otherColor, squaresGivingCheck);
  if (checkmate) {
    // game over stuff
    game.active = false;
    game.winner = game.turn;
    game.causeOfDeath = 'checkmate';
  }

  // history stuff
  const moveNotation = gameboard.get.moveNotation(
    from,
    to,
    promote,
    squaresGivingCheck.length > 0,
    checkmate,
    game.board
  );
  const newHistory = History(game.history).insertMove(moveNotation);

  game.board = newBoardState;
  game.castle = castleRights;
  game.checks = squaresGivingCheck;
  game.history = newHistory;

  // deal with turn/timer
  const timeSpent = Date.now() - game.turnStart;
  const base = game[color].timeLeft - timeSpent;

  game[color].timeLeft =
    base > 0 ? addTime(base, game.increment, 'seconds') : 0;
  game.turnStart = Date.now();
  game.turn = otherColor;

  const updatedGame = await game.save();
  return res.json(updatedGame);
};
