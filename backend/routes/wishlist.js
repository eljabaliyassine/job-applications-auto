// backend/routes/wishlist.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// GET /api/wishlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, productIds: [] });
    }

    const savedProducts = await Product.find({ id: { $in: wishlist.productIds } });

    res.json({
      success: true,
      count: savedProducts.length,
      items: savedProducts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wishlist/toggle
router.post('/toggle', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "L'identifiant du produit est requis." });
    }

    const pId = parseInt(productId, 10);
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, productIds: [pId] });
      return res.json({ success: true, isSaved: true, message: "Produit ajouté aux favoris", count: 1 });
    }

    const index = wishlist.productIds.indexOf(pId);
    let isSaved = false;

    if (index > -1) {
      wishlist.productIds.splice(index, 1);
      isSaved = false;
    } else {
      wishlist.productIds.push(pId);
      isSaved = true;
    }

    await wishlist.save();

    res.json({
      success: true,
      isSaved,
      message: isSaved ? "Produit ajouté aux favoris" : "Produit retiré des favoris",
      count: wishlist.productIds.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
