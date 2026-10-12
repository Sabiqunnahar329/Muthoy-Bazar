import ActivityLog from '../models/ActivityLog.js';
import { asyncHandler } from '../utils/helpers.js';

export const listActivity = asyncHandler(async (req, res) => {
  const activity = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .select('actorName actorRole action resource createdAt');
  res.json(activity);
});
