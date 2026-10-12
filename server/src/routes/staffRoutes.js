import { Router } from 'express';
import { list, create, update, remove } from '../controllers/staffController.js';
import { protect, staff, can } from '../middleware/auth.js';

const r = Router();
r.use(protect, staff('admin'), can('staff'));
r.get('/', list);
r.post('/', create);
r.put('/:id', update);
r.delete('/:id', remove);
export default r;
