import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, default: Date.now, index: true },
    note: { type: String, default: '', trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
export default mongoose.model('Expense', expenseSchema);
