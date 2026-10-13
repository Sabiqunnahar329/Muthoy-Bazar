import mongoose from 'mongoose';

const threadMessageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ['customer', 'admin'], required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    accessTokenHash: { type: String, index: true, select: false },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    subject: { type: String, default: '', trim: true },
    message: { type: String, required: true, trim: true },
    source: { type: String, enum: ['contact', 'support'], default: 'contact' },
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread', index: true },
    reply: { type: String, default: '' },
    repliedAt: Date,
    replyReadAt: Date,
    thread: { type: [threadMessageSchema], default: [] },
  },
  { timestamps: true }
);
export default mongoose.model('Message', messageSchema);
