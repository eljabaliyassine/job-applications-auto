// backend/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  itemTotal: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String, default: null },
  tax: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: 'France' }
  },
  paymentMethod: { type: String, default: 'Carte Bancaire (Simulée)' },
  status: {
    type: String,
    enum: ['En préparation', 'Expédiée', 'Livrée', 'Annulée'],
    default: 'En préparation'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);

