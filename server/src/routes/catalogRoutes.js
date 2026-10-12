import { Router } from 'express';
import { catalogStatus, metaFeed } from '../controllers/catalogController.js';
import { protect, staff, can } from '../middleware/auth.js';

const r = Router();
r.get('/meta.csv', metaFeed);
r.get('/status', protect, staff(), can('products'), catalogStatus);
export default r;
