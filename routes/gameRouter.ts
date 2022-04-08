import express from 'express';
import { createGame, getGame, updateGame } from '../controllers/gameController';

const router = express.Router();

router.post('/', createGame);
router.get('/:gameId', getGame);
router.put('/:gameId', updateGame);

export default router;
