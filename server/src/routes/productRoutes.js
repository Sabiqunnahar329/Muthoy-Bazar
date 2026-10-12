import { Router } from 'express';
import { list, brands, getOne, create, update, setStock, remove, imageAudit } from '../controllers/productController.js';
import { protect, staff } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const r = Router();
const manage = [protect, staff('admin', 'inventory_manager')];
r.get('/', list);
r.get('/brands', brands);
r.get('/admin/image-audit', ...manage, imageAudit);
r.get('/:id', getOne);
r.post('/', ...manage, upload.array('images', 5), create);
r.put('/:id', ...manage, upload.array('images', 5), update);
r.patch('/:id/stock', ...manage, setStock);
r.delete('/:id', ...manage, remove);
export default r;
