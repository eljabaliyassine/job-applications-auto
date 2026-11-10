// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const seedDatabase = require('./seed');

const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const ordersRouter = require('./routes/orders');
const couponsRouter = require('./routes/coupons');
const wishlistRouter = require('./routes/wishlist');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares globaux
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes de l'API RESTful
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/admin', adminRouter);

// Endpoint de santé / diagnostic
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'MongoDB Connected',
    service: 'TechStore API RESTful v2.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    node: process.version,
    timestamp: new Date().toISOString()
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error("Erreur serveur non gérée :", err);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

// Démarrage du serveur et connexion à MongoDB
const startServer = async () => {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`[TechStore API] Serveur démarré avec succès`);
    console.log(`[MongoDB]      Base de données connectée et persistante`);
    console.log(`[API Base]     http://localhost:${PORT}`);
    console.log(`[Catalogue]    http://localhost:${PORT}/api/products`);
    console.log(`[Coupons]      http://localhost:${PORT}/api/coupons`);
    console.log(`[Wishlist]     http://localhost:${PORT}/api/wishlist`);
    console.log(`[Admin Panel]  http://localhost:${PORT}/api/admin/stats`);
    console.log(`====================================================`);
  });
};

startServer();
