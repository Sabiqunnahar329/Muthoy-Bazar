import { Router } from 'express';
import { list, create, update, remove } from '../controllers/expenseController.js';
import { protect, staff, can } from '../middleware/auth.js';

const r = Router();
r.use(protect, staff(), can('expenses'));
r.get('/', list);
r.post('/', create);
r.put('/:id', update);
r.delete('/:id', remove);
export default r;
