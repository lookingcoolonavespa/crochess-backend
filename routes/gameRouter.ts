import express from 'express';
import {
  createGame,
  // updateGame,
} from '../controllers/gameController';

const router = express.Router();

// router.get('/', getGameSeeks);

// router.get('/:gameId');

router.post('/', createGame);

// router.put('/:gameId', updateGame);

export default router;
