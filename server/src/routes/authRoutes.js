import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, me, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { blockCheck } from '../middleware/blocklist.js';

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 40, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many attempts. Try again in a few minutes.' } });
const r = Router();
r.post('/register', blockCheck, limiter, register);
r.post('/login', limiter, login);
r.post('/forgot-password', blockCheck, limiter, forgotPassword);
r.post('/reset-password', limiter, resetPassword);
r.get('/me', protect, me);
export default r;
