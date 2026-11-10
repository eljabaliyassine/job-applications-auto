// backend/models/Wishlist.js
const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  productIds: [{ type: Number }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Wishlist', wishlistSchema);

