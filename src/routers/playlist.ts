import express from 'express';
const router = express.Router();
import { authMiddleware } from '../middleware/auth';
import { uploadImage } from '../middleware/image';

import {
  create,
  update,
  addSong,
  get,
  deleteSong,
} from '../controllers/playlist';

router.post('/create', authMiddleware, uploadImage, create);
router.get('/:id', get);
router.patch('/:id', authMiddleware, uploadImage, update);
router.post('/addSong', authMiddleware, addSong);
router.delete('/deleteSong', authMiddleware, deleteSong);

export default router;
