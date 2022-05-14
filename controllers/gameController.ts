import { HydratedDocument } from 'mongoose';
import Game from '../models/Game';
import { GameInterface } from '../types/interfaces';
import { MiddleWare } from '../types/types';
import { io } from '../app';
import { addTime } from '../utils/timeStuff';
import initGameboard from '../utils/initGameboard';
import { startingPositions, Gameboard, History } from 'crochess-api';
import getWhiteOrBlack from '../utils/getWhiteOrBlack';
import { GameboardObj } from 'crochess-api/dist/types/interfaces';
import GameSeek from '../models/GameSeek';

export const createGame: MiddleWare = async (req, res) => {
  const gameboard = initGameboard(startingPositions.standard);

  const seekerColor = getWhiteOrBlack();

  const game = new Game({
    white: {
      player: seekerColor === 'white' ? req.body.seeker : req.body.challenger,
      timeLeft: req.body.time,
    },
    black: {
      player: seekerColor === 'black' ? req.body.seeker : req.body.challenger,
      timeLeft: req.body.time,
    },
    board: gameboard.board,
    time: req.body.time,
    increment: req.body.increment,
    turn: 'white',
    turnStart: Date.now(),
    claimDraw: {
      white: false,
      black: false,
    },
    active: true,
  });

  await GameSeek.deleteMany({ seeker: req.body.challenger });

  io.of('games').to(req.body.seeker).emit('startGame', {
    cookieId: req.body.seeker,
    gameId: game._id,
    color: seekerColor,
  });

  await game.save();

  return res.send({
    cookieId: req.body.challenger,
    gameId: game._id.toString(),
    color: seekerColor === 'white' ? 'black' : 'white',
  });
};

export const getGame: MiddleWare = async (req, res, next) => {
  if (req.params.gameId === 'undefined') return next();
  const game = await Game.findById(req.params.gameId);
  return res.send(game);
};

export const makeMove: MiddleWare = async (req, res) => {
  const start = Date.now();

  const game: HydratedDocument<GameInterface> | null = await Game.findById(
    req.params.gameId
  );
  if (!game) return res.status(400).send('game not found');
  if (!game.active) res.status(409).send('game is over');

  const { playerId, from, to, promote } = req.body;
  if (playerId !== game[game.turn].player)
    return res.status(409).send('not your turn');

  // validate move
  const gameboard: GameboardObj = Gameboard(
    game.board,
    game.checks,
    game.castle
  );
  const piece = gameboard.at(from).piece;
  if (!piece) return res.status(409).send('not valid move');
  if (piece.color !== game.turn) return res.status(409).send('not valid move');

  const validationElapsed = Date.now() - start;
  const makeMoveStart = Date.now();
  // make move and make checks
  const newBoard = gameboard.makeMove(from, to, promote);
  if (!newBoard) return res.status(409).send('not valid move');
  const castleRights = gameboard.get.castleRightsAfterMove(to);
  const squaresGivingCheck = gameboard.get.squaresGivingCheckAfterMove(
    from,
    to
  );

  game.claimDraw = {
    white: false,
    black: false,
  };

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

  const makeMoveElapsed = Date.now() - makeMoveStart;

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

  game.board = newBoard;
  game.castle = castleRights;
  game.checks = squaresGivingCheck;
  game.history = newHistory;

  const checkDrawStart = Date.now();
  // check for draw
  const pieceMap = gameboard.get.pieceMap();
  const boardState = {
    pieceMap,
    castleRights,
    enPassant: gameboard.board.get(gameboard.enPassant.getSquare(to, color))
      ?.enPassant,
  };
  const allBoardStates = gameboard.get.boardStatesFromHistory(game.history);
  const repetition = gameboard.isDraw.byRepetition(allBoardStates, boardState);
  const stalemate = gameboard.isDraw.byStalemate(color);
  const insufficientMaterial =
    gameboard.isDraw.byInsufficientMaterial(pieceMap);
  const moveRule = gameboard.isDraw.byMoveRule(newHistory);

  if (repetition.fivefold || stalemate || insufficientMaterial) {
    // draw imminent
    game.active = false;
    game.winner = null;

    let causeOfDeath = '';

    switch (true) {
      case repetition.fivefold:
        causeOfDeath = 'fivefold repetition';
        break;
      case stalemate:
        causeOfDeath = 'stalemate';
        break;
      case insufficientMaterial:
        causeOfDeath = 'insufficient material';
        break;
    }

    game.causeOfDeath = causeOfDeath;
  } else if (repetition.threefold || moveRule.fifty) {
    // claim draw available
    game.claimDraw = {
      white: true,
      black: true,
    };
  }

  const checkDrawElapsed = Date.now() - checkDrawStart;

  // deal with turn/timer
  const timeSpent = Date.now() - (game.turnStart as number);
  const base = game[color].timeLeft - timeSpent;

  game[color].timeLeft =
    base > 0 ? addTime(base, game.increment, 'seconds') : 0;

  if (!checkmate) game.turnStart = Date.now();
  game.turn = otherColor;

  await game.save();

  return res.json({
    validationElapsed,
    makeMoveElapsed,
    checkDrawElapsed,
    total: Date.now() - start,
  });
};

export const updateGameStatus: MiddleWare = async (req, res) => {
  const game: HydratedDocument<GameInterface> | null = await Game.findById(
    req.params.gameId
  );

  if (!game) return res.status(400).send('game not found');

  const activePlayer = ['white', 'black'].some((color) => {
    return (
      req.cookies[`${req.params.gameId}(${color})`] ===
      game[color as 'white' | 'black'].player
    );
  });
  if (!activePlayer) return res.send("you're not an active player");

  const { active, winner, causeOfDeath } = req.body;

  game.active = active;
  game.winner = winner;
  game.causeOfDeath = causeOfDeath;
  if (!game.active) game.turnStart = undefined;

  await game.save();
};

export const updateDrawStatus: MiddleWare = async (req, res) => {
  const game: HydratedDocument<GameInterface> | null = await Game.findById(
    req.params.gameId
  );

  if (!game) return res.status(400).send('game not found');

  const activePlayer = ['white', 'black'].some((color) => {
    return (
      req.cookies[`${req.params.gameId}(${color})`] ===
      game[color as 'white' | 'black'].player
    );
  });
  if (!activePlayer) return res.send("you're not an active player");

  const { claimDraw } = req.body;
  game.claimDraw = claimDraw;

  await game.save();
};
