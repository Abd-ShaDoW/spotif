import express from 'express';
const router = express.Router();
import { authMiddleware } from '../middleware/auth';
import { uploadImage } from '../middleware/image';
import { uploadSong } from '../middleware/song';

import { create, get, update, addArtist } from '../controllers/song';

router.post('/create', authMiddleware, uploadSong, create);
router.get('/:id', get);
router.post('/:id', authMiddleware, addArtist);
router.patch('/:id', authMiddleware, uploadImage, update);

export default router;
