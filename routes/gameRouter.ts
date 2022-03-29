import express from 'express';
import {
  createGameSeek,
  createGame,
  // updateGame,
  getGameSeeks,
} from '../controllers/gameController';

const router = express.Router();

router.get('/', getGameSeeks);

router.get('/:gameId');

router.post('/', createGameSeek);

router.post('/:gameSeekId', createGame);

// router.put('/:gameId', updateGame);

export default router;
