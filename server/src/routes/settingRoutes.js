import { Router } from 'express';
import { read, update, updateWebsite } from '../controllers/settingController.js';
import { protect, staff, can } from '../middleware/auth.js';

const r = Router();
r.get('/', read); // public store info
r.put('/', protect, staff(), can('settings'), update);
r.put('/website', protect, staff(), can('settings'), updateWebsite);
export default r;
