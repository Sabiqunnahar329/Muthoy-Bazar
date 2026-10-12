import { Router } from 'express';
import { validate, list, create, remove } from '../controllers/couponController.js';
import { protect, staff } from '../middleware/auth.js';

const r = Router();
r.post('/validate', validate);
r.get('/', protect, staff('admin'), list);
r.post('/', protect, staff('admin'), create);
r.delete('/:id', protect, staff('admin'), remove);
export default r;
