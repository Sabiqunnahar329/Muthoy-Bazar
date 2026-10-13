import { Router } from 'express';
import { create, track, mine, list, getOne, setStatus, getReviewOrder, submitOrderReview } from '../controllers/orderController.js';
import { protect, optionalAuth, staff } from '../middleware/auth.js';
import { blockCheck } from '../middleware/blocklist.js';

const r = Router();
r.post('/', blockCheck, optionalAuth, create); // guests can order
r.get('/track/:number', track);
r.get('/review/:token', getReviewOrder);
r.post('/review/:token', submitOrderReview);
r.get('/my', protect, mine);
r.get('/', protect, staff(), list);
r.get('/:id', protect, staff(), getOne);
r.patch('/:id/status', protect, staff('admin', 'delivery_operator'), setStatus);
export default r;
