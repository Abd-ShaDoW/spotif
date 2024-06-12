import express from 'express';
const router = express.Router();
import { authMiddleware } from '../middleware/auth';
import { uploadImage } from '../middleware/image';
import { uploadSong } from '../middleware/song';

import {
  create,
  get,
  update,
  addArtist,
  addFavorite,
  getFavorites,
  unfavorite,
} from '../controllers/song';

router.post('/create', authMiddleware, uploadSong, create);
router.get('/:id', get);
router.post('/:id', authMiddleware, addArtist);
router.patch('/:id', authMiddleware, uploadImage, update);
router.post('/favorite', authMiddleware, addFavorite);
router.delete('/unfavorite', authMiddleware, unfavorite);
router.get('/getfavorite', authMiddleware, getFavorites);
export default router;
