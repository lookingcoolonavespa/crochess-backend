import express from 'express';
import {
  createGame,
  // updateGame,
  joinGameRoom,
} from '../controllers/gameController';

const router = express.Router();

// router.get('/', getGameSeeks);

// router.get('/:gameId');

router.post('/', createGame);

router.post('/', createGame, joinGameRoom);

// router.put('/:gameId', updateGame);

export default router;
