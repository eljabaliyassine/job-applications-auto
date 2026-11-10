// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

// Sécuriser toutes les routes admin
router.use(authMiddleware);
router.use(adminOnly);

// ─────────────────────────────────────────────────────────────
// 1. STATS & ANALYTICS
// ─────────────────────────────────────────────────────────────

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const orders = await Order.find();
    const completedOrders = orders.filter(o => o.status !== 'Annulée');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
    const lowStockCount = await Product.countDocuments({ stock: { $lte: 6 } });
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments();

    res.json({
      success: true,
      data: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        avgOrderValue: Number(avgOrderValue.toFixed(2)),
        totalCustomers,
        totalProducts,
        lowStockCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats/low-stock
router.get('/stats/low-stock', async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold, 10) || 6;
    const lowStockProducts = await Product.find({ stock: { $lte: threshold } }).sort({ stock: 1 });

    res.json({
      success: true,
      threshold,
      count: lowStockProducts.length,
      products: lowStockProducts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats/top-products
router.get('/stats/top-products', async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'Annulée' } });
    const salesMap = new Map();

    for (const order of orders) {
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const current = salesMap.get(item.id) || {
            id: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            category: item.category,
            quantitySold: 0,
            totalRevenue: 0
          };
          current.quantitySold += item.quantity;
          current.totalRevenue += item.itemTotal || (item.price * item.quantity);
          salesMap.set(item.id, current);
        }
      }
    }

    const top = Array.from(salesMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    res.json({
      success: true,
      topProducts: top
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 2. PRODUCT MANAGEMENT (CRUD & STOCK)
// ─────────────────────────────────────────────────────────────

// GET /api/admin/products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/products
router.post('/products', async (req, res) => {
  try {
    const { name, category, price, stock, description, image, badge, features } = req.body;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({ error: "Le nom, le prix et le stock sont requis." });
    }

    const maxIdProduct = await Product.findOne().sort({ id: -1 });
    const nextId = maxIdProduct ? maxIdProduct.id + 1 : 1;

    const newProduct = await Product.create({
      id: nextId,
      name: name.trim(),
      category: category ? category.trim() : "Accessoires",
      price: parseFloat(price),
      stock: parseInt(stock, 10) || 10,
      rating: 5.0,
      numReviews: 0,
      badge: badge || null,
      description: description ? description.trim() : "Produit haute performance.",
      image: image || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=700&q=80",
      features: Array.isArray(features) ? features : ["Qualité Pro", "Garantie 2 ans"]
    });

    res.status(201).json({
      success: true,
      message: `Produit '${newProduct.name}' créé avec succès dans MongoDB.`,
      product: newProduct
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/products/:id
router.put('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = await Product.findOne({ id });

    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé." });
    }

    const { name, category, price, stock, description, image, badge, features } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock, 10);
    if (description !== undefined) product.description = description.trim();
    if (image !== undefined) product.image = image;
    if (badge !== undefined) product.badge = badge || null;
    if (features !== undefined) product.features = features;

    await product.save();

    res.json({
      success: true,
      message: `Produit #${id} mis à jour avec succès.`,
      product
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const removed = await Product.findOneAndDelete({ id });

    if (!removed) {
      return res.status(404).json({ error: "Produit non trouvé." });
    }

    res.json({
      success: true,
      message: `Produit '${removed.name}' supprimé de la base de données.`,
      productId: id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/products/:id/restock
router.post('/products/:id/restock', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const amount = parseInt(req.body.amount, 10) || 15;

    const product = await Product.findOne({ id });
    if (!product) {
      return res.status(404).json({ error: "Produit introuvable." });
    }

    product.stock += amount;
    await product.save();

    res.json({
      success: true,
      message: `Stock de '${product.name}' réapprovisionné (+${amount} unités). Nouveau stock : ${product.stock}`,
      newStock: product.stock,
      productId: id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 3. ORDER MANAGEMENT
// ─────────────────────────────────────────────────────────────

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({ id });
    if (!order) {
      return res.status(404).json({ error: "Commande introuvable." });
    }

    if (!status) {
      return res.status(400).json({ error: "Le nouveau statut est requis." });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: `Statut de la commande #${id} mis à jour : ${status}`,
      order
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/orders/:id
router.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Order.findOneAndDelete({ id });

    if (!removed) {
      return res.status(404).json({ error: "Commande introuvable." });
    }

    res.json({
      success: true,
      message: `Commande #${id} supprimée de la base de données.`,
      orderId: id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 4. COUPON MANAGEMENT
// ─────────────────────────────────────────────────────────────

// POST /api/admin/coupons
router.post('/coupons', async (req, res) => {
  try {
    const { code, discountType, discountValue, maxDiscount, minOrderValue, expiresAt, description } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ error: "Code, type et valeur requis." });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(409).json({ error: `Le code promo '${cleanCode}' existe déjà.` });
    }

    const newCoupon = await Coupon.create({
      code: cleanCode,
      discountType: discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: parseFloat(discountValue),
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : 100,
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
      isActive: true,
      expiresAt: expiresAt || new Date("2027-12-31T23:59:59.000Z"),
      description: description || `Réduction de ${discountValue}${discountType === 'percentage' ? '%' : '€'}`
    });

    res.status(201).json({
      success: true,
      message: `Code promo '${cleanCode}' créé dans MongoDB.`,
      coupon: newCoupon
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/coupons/:code/toggle
router.patch('/coupons/:code/toggle', async (req, res) => {
  try {
    const cleanCode = req.params.code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({ error: "Code promo introuvable." });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      success: true,
      message: `Code promo '${cleanCode}' ${coupon.isActive ? 'activé' : 'désactivé'}.`,
      isActive: coupon.isActive
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/coupons/:code
router.delete('/coupons/:code', async (req, res) => {
  try {
    const cleanCode = req.params.code.trim().toUpperCase();
    const removed = await Coupon.findOneAndDelete({ code: cleanCode });

    if (!removed) {
      return res.status(404).json({ error: "Code promo introuvable." });
    }

    res.json({
      success: true,
      message: `Code promo '${cleanCode}' supprimé.`,
      code: cleanCode
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 5. CUSTOMER / USER MANAGEMENT
// ─────────────────────────────────────────────────────────────

// GET /api/admin/customers
router.get('/customers', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    const orders = await Order.find({ status: { $ne: 'Annulée' } });

    const customerList = users.map(u => {
      const userOrders = orders.filter(o => o.userId === u._id.toString() || o.userEmail === u.email);
      const totalSpent = userOrders.reduce((sum, o) => sum + o.grandTotal, 0);

      return {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role || 'customer',
        createdAt: u.createdAt,
        orderCount: userOrders.length,
        totalSpent: Number(totalSpent.toFixed(2))
      };
    });

    res.json({
      success: true,
      count: customerList.length,
      customers: customerList
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/customers/:id/role
router.patch('/customers/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    const { role } = req.body;
    if (!role || !['admin', 'customer'].includes(role)) {
      return res.status(400).json({ error: "Rôle invalide." });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `Rôle de ${user.name} mis à jour : ${role}`,
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
