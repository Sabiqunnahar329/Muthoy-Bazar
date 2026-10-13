import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { create, inbox, markInboxRead, list, markRead, reply, remove } from '../controllers/supportController.js';
import { protect, optionalAuth, staff, can } from '../middleware/auth.js';
import { blockCheck } from '../middleware/blocklist.js';

const limiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many messages. Please try again later.' } });
const r = Router();
r.post('/', blockCheck, limiter, optionalAuth, create); // public contact form
r.post('/inbox', optionalAuth, inbox);
r.patch('/inbox/:id/read', optionalAuth, markInboxRead);
const admin = [protect, staff(), can('support')];
r.get('/', ...admin, list);
r.patch('/:id/read', ...admin, markRead);
r.post('/:id/reply', ...admin, reply);
r.delete('/:id', ...admin, remove);
export default r;
