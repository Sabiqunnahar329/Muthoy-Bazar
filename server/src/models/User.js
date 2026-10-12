import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const STAFF_ROLES = ['super_admin', 'admin', 'inventory_manager', 'delivery_operator'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    phone: { type: String, trim: true, unique: true, sparse: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', ...STAFF_ROLES], default: 'customer' },
    active: { type: Boolean, default: true },
    permissions: { type: [String], default: [] },
    resetCode: { type: String, select: false },
    resetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
