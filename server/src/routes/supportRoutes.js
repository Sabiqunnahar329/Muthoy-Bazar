import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { create, list, markRead, reply, remove } from '../controllers/supportController.js';
import { protect, staff, can } from '../middleware/auth.js';
import { blockCheck } from '../middleware/blocklist.js';

const limiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many messages. Please try again later.' } });
const r = Router();
r.post('/', blockCheck, limiter, create); // public contact form
const admin = [protect, staff(), can('support')];
r.get('/', ...admin, list);
r.patch('/:id/read', ...admin, markRead);
r.post('/:id/reply', ...admin, reply);
r.delete('/:id', ...admin, remove);
export default r;
