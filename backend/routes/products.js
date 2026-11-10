// backend/routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(['Tous', ...categories]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    if (category && category !== 'Tous') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { price: 1 };
    else if (sort === 'price-desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };

    const products = await Product.find(query).sort(sortOptions);

    res.json({
      total: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = await Product.findOne({ id });
    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé." });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const prodReviews = await Review.find({ productId }).sort({ createdAt: -1 });

    const avg = prodReviews.length > 0
      ? Number((prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1))
      : 5.0;

    res.json({
      productId,
      count: prodReviews.length,
      averageRating: avg,
      reviews: prodReviews
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé." });
    }

    const { rating, comment, title, userName } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ error: "La note (1-5) et le commentaire sont requis." });
    }

    const newReview = await Review.create({
      productId,
      userName: userName || (req.user ? req.user.name : "Client Vérifié"),
      rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
      title: title || "Avis client certifié",
      comment: comment.trim()
    });

    // Recalculer le rating moyen
    const allReviews = await Review.find({ productId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    product.rating = Number(avg.toFixed(1));
    product.numReviews = allReviews.length;
    await product.save();

    res.status(201).json({
      message: "Avis ajouté avec succès !",
      review: newReview,
      updatedProductRating: product.rating
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
