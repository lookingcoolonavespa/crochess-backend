import express from 'express';
import {
  createGameSeek,
  beginGame,
  updateGame,
  getGameSeeks,
} from '../controllers/gameController';

const router = express.Router();

router.get('/', getGameSeeks);

router.get('/:gameId');

router.post('/', createGameSeek);

router.post('/:gameId', beginGame);

router.put('/:gameId', updateGame);

export default router;
