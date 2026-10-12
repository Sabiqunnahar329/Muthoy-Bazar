import { Router } from 'express';
import { list, create, update, remove, bySlug } from '../controllers/landingController.js';
import { protect, staff, can } from '../middleware/auth.js';

const r = Router();
r.get('/page/:slug', bySlug); // public
const admin = [protect, staff(), can('landing')];
r.get('/', ...admin, list);
r.post('/', ...admin, create);
r.put('/:id', ...admin, update);
r.delete('/:id', ...admin, remove);
export default r;
