import mongoose from 'mongoose';

export const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer: { name: String, phone: { type: String, index: true }, city: String, address: String },
    zone: { type: String, enum: ['inside', 'outside'], default: 'inside' },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        image: String,
        price: Number,
        qty: Number,
      },
    ],
    subtotal: Number,
    shippingFee: Number,
    discount: { type: Number, default: 0 },
    couponCode: String,
    total: Number,
    paymentMethod: { type: String, enum: ['COD', 'bKash', 'Nagad'], default: 'COD' },
    senderNumber: String,
    trxId: String,
    status: { type: String, enum: STATUSES, default: 'Pending' },
    flagged: { type: Boolean, default: false },
    ip: { type: String, index: true },
  },
  { timestamps: true }
);

export const Counter = mongoose.model('Counter', new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } }));
export default mongoose.model('Order', orderSchema);
