// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// POST /api/orders (Créer une commande sécurisée dans MongoDB)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'Carte Bancaire (Simulée)', couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Votre panier est vide." });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zip) {
      return res.status(400).json({ error: "L'adresse de livraison complète est requise." });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const clientItem of items) {
      const dbProduct = await Product.findOne({ id: clientItem.id });
      if (!dbProduct) {
        return res.status(400).json({ error: `Le produit ID #${clientItem.id} n'existe pas.` });
      }

      const qty = parseInt(clientItem.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ error: `Quantité invalide pour ${dbProduct.name}.` });
      }

      if (dbProduct.stock < qty) {
        return res.status(400).json({
          error: `Stock insuffisant pour '${dbProduct.name}'. Disponible : ${dbProduct.stock}, demandé : ${qty}.`
        });
      }

      // Déduire le stock dans MongoDB
      dbProduct.stock -= qty;
      await dbProduct.save();

      const itemTotal = Number((dbProduct.price * qty).toFixed(2));
      subtotal += itemTotal;

      validatedItems.push({
        id: dbProduct.id,
        name: dbProduct.name,
        price: dbProduct.price,
        image: dbProduct.image,
        category: dbProduct.category,
        quantity: qty,
        itemTotal
      });
    }

    // Validation coupon
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      const cp = await Coupon.findOne({ code: cleanCode, isActive: true });
      if (cp && new Date() <= new Date(cp.expiresAt) && subtotal >= cp.minOrderValue) {
        if (cp.discountType === 'percentage') {
          discountAmount = (subtotal * cp.discountValue) / 100;
          if (cp.maxDiscount && discountAmount > cp.maxDiscount) {
            discountAmount = cp.maxDiscount;
          }
        } else {
          discountAmount = Math.min(cp.discountValue, subtotal);
        }
        appliedCoupon = cp.code;
      }
    }

    subtotal = Number(subtotal.toFixed(2));
    discountAmount = Number(discountAmount.toFixed(2));
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = Number((discountedSubtotal * 0.20).toFixed(2));
    const shippingFee = subtotal >= 500 ? 0 : 15.00;
    const grandTotal = Number((discountedSubtotal + tax + shippingFee).toFixed(2));

    const newOrder = await Order.create({
      id: `CMD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`,
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      items: validatedItems,
      subtotal,
      discountAmount,
      couponCode: appliedCoupon,
      tax,
      shippingFee,
      grandTotal,
      shippingAddress: {
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        zip: shippingAddress.zip.trim(),
        country: shippingAddress.country || 'France'
      },
      paymentMethod,
      status: 'En préparation'
    });

    return res.status(201).json({
      message: "Félicitations ! Votre commande a été enregistrée avec succès.",
      order: newOrder
    });
  } catch (error) {
    console.error("Erreur commande :", error);
    return res.status(500).json({ error: "Erreur interne lors de la commande." });
  }
});

// GET /api/orders/my-orders
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const userOrders = await Order.find({
      $or: [{ userId: req.user.id }, { userEmail: req.user.email }]
    }).sort({ createdAt: -1 });

    res.json({
      total: userOrders.length,
      orders: userOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
