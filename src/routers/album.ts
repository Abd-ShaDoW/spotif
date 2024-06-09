import express from 'express';
const router = express.Router();
import { authMiddleware } from '../middleware/auth';
import { uploadImage } from '../middleware/image';

import { get, create } from '../controllers/album';

router.post('/create', authMiddleware, uploadImage, create);
router.get('/:id', get);

export default router;
