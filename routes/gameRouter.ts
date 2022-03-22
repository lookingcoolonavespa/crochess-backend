import express from 'express';
import { createGame, beginGame } from '../controllers/gameController';

const router = express.Router();

router.get('/games/:gameId');

router.post('/games/', createGame);

router.post('/games/:gameId/begin', beginGame);

export default router;
