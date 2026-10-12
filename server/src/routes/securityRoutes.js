import { Router } from 'express';
import { lookup, listBlacklist, addBlacklist, removeBlacklist } from '../controllers/securityController.js';
import { protect, staff, can } from '../middleware/auth.js';

const r = Router();
r.use(protect, staff(), can('security'));
r.get('/lookup', lookup);
r.get('/blacklist', listBlacklist);
r.post('/blacklist', addBlacklist);
r.delete('/blacklist/:id', removeBlacklist);
export default r;
