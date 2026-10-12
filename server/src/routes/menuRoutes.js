import { Router } from 'express';
import { publicMenus, all, create, update, remove, reorder, defaults } from '../controllers/menuController.js';
import { protect, staff, can } from '../middleware/auth.js';

const r = Router();
r.get('/', publicMenus); // public
const admin = [protect, staff(), can('menu')];
r.get('/all', ...admin, all);
r.post('/', ...admin, create);
r.post('/defaults', ...admin, defaults);
r.put('/reorder', ...admin, reorder);
r.put('/:id', ...admin, update);
r.delete('/:id', ...admin, remove);
export default r;
