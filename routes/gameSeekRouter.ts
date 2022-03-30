import express from 'express';
import {
  createGameSeek,
  deleteGameSeek,
  getGameSeeks,
} from '../controllers/gameSeekController';

const router = express.Router();

router.get('/', getGameSeeks);
router.post('/', createGameSeek);
router.delete('/:id', deleteGameSeek);

export default router;
