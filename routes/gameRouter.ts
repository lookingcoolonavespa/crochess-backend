import express from 'express';
import {
  createGame,
  beginGame,
  updateGame,
} from '../controllers/gameController';

const router = express.Router();

router.get('/:gameId');

router.post('/', createGame);

router.post('/:gameId', beginGame);

router.put('/:gameId', updateGame);

export default router;
