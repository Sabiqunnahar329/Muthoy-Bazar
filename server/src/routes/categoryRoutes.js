import { Router } from 'express';
import { list, create, update, remove } from '../controllers/categoryController.js';
import { protect, staff } from '../middleware/auth.js';

const r = Router();
r.get('/', list);
r.post('/', protect, staff('admin', 'inventory_manager'), create);
r.put('/:id', protect, staff('admin', 'inventory_manager'), update);
r.delete('/:id', protect, staff('admin', 'inventory_manager'), remove);
export default r;
