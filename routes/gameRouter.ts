import express from 'express';
import {
  createGame,
  getGame,
  makeMove,
  updateDrawStatus,
  updateGameStatus,
} from '../controllers/gameController';

const router = express.Router();

router.put('/', createGame);
router.get('/:gameId', getGame);
router.patch('/:gameId/move', makeMove);
router.patch('/:gameId/status', updateGameStatus);
router.patch('/:gameId/draw', updateDrawStatus);

export default router;
