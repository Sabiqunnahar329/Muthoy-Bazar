import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { pixelStats, recordEvent } from '../controllers/analyticsController.js';
import { protect, staff, can } from '../middleware/auth.js';

const r = Router();
const eventLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many analytics events. Try again later.' },
});

r.post('/events', eventLimit, recordEvent);
r.get('/stats', protect, staff(), can('reports'), pixelStats);
export default r;
