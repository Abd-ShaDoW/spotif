import express from 'express';
const router = express.Router();
import { authMiddleware } from '../middleware/auth';
import { uploadImage } from '../middleware/image';

import {
  signIn,
  signUp,
  update,
  confirmEmail,
  requestPasswordReset,
  resetPassword,
  addFavorite,
  unfavorite,
  getFavorites,
} from '../controllers/user';

router.post('/signup', uploadImage, signUp);
router.get('/confirm-email', confirmEmail);
router.post('/signin', signIn);
router.patch('/update', authMiddleware, uploadImage, update);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/favorite', authMiddleware, addFavorite);
router.delete('/unfavorite', authMiddleware, unfavorite);
router.get('/getfavorite', authMiddleware, getFavorites);
export default router;
