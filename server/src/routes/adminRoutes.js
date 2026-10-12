import { Router } from 'express';
import { stats, customers, exportCustomers } from '../controllers/adminController.js';
import { reports } from '../controllers/reportController.js';
import { serverStats, counts } from '../controllers/systemController.js';
import { listActivity } from '../controllers/activityController.js';
import { protect, staff, can } from '../middleware/auth.js';

const r = Router();
r.use(protect, staff());
r.get('/stats', stats);
r.get('/counts', counts);
r.get('/activity-log', can('settings'), listActivity);
r.get('/customers', customers);
r.get('/customers/export', exportCustomers);
r.get('/reports', can('reports'), reports);
r.get('/server-stats', can('settings'), serverStats);
export default r;
