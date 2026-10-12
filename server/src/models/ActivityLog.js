import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('ActivityLog', activityLogSchema);
