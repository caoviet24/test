import express from 'express';
import { register, login, refreshToken, authMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, authMe);
router.get('/refresh', refreshToken);
router.post('/register', register);
router.post('/login', login);


export default router;