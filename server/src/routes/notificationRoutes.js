import { Router } from 'express';
import { list, markRead, markAllRead, remove, clearRead } from '../controllers/notificationController.js';
import { protect, staff, can } from '../middleware/auth.js';

const r = Router();
r.use(protect, staff(), can('notifications'));
r.get('/', list);
r.patch('/read-all', markAllRead);
r.delete('/read', clearRead);
r.patch('/:id/read', markRead);
r.delete('/:id', remove);
export default r;
