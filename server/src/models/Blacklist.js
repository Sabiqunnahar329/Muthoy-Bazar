import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['phone', 'ip'], required: true },
    value: { type: String, required: true, trim: true },
    reason: { type: String, default: '', trim: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
blacklistSchema.index({ type: 1, value: 1 }, { unique: true });
export default mongoose.model('Blacklist', blacklistSchema);
