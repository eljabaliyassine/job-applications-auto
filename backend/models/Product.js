// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 10, min: 0 },
  rating: { type: Number, default: 5.0 },
  numReviews: { type: Number, default: 0 },
  badge: { type: String, default: null },
  description: { type: String, default: '' },
  image: { type: String, required: true },
  features: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

