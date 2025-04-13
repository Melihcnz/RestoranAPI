const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const tableRoutes = require('./routes/table');
const orderRoutes = require('./routes/order');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const ingredientRoutes = require('./routes/ingredient');
const productIngredientRoutes = require('./routes/productIngredient');
const stockRoutes = require('./routes/stock');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ana sayfa için karşılama mesajı
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Restoran API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          h2 {
            color: #3498db;
            margin-top: 30px;
          }
          code {
            background-color: #f8f8f8;
            padding: 2px 5px;
            border-radius: 4px;
            font-family: monospace;
          }
          ul {
            padding-left: 20px;
          }
          .endpoint {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Restoran Yönetim Sistemi API</h1>
        <p>API başarıyla çalışıyor! Restoran yönetim sistemi için RESTful API servisi.</p>
        
        <h2>Temel Endpointler</h2>
        <div class="endpoint">
          <code>POST /api/auth/register</code> - Yeni kullanıcı kaydı
        </div>
        <div class="endpoint">
          <code>POST /api/auth/login</code> - Kullanıcı girişi
        </div>
        <div class="endpoint">
          <code>GET /api/products</code> - Tüm ürünleri listele
        </div>
        <div class="endpoint">
          <code>GET /api/categories</code> - Tüm kategorileri listele
        </div>
        <div class="endpoint">
          <code>GET /api/ingredients</code> - Tüm malzemeleri listele
        </div>
        <div class="endpoint">
          <code>GET /api/stock/report</code> - Stok raporu
        </div>
        
        <h2>Daha Fazla Bilgi</h2>
        <p>Tüm API dokümantasyonu ve detaylı açıklamalar için GitHub repo'muzu ziyaret edin.</p>
        <p>Geliştirici: Melih Canaz</p>
        <p>Sürüm: 1.0.0</p>
      </body>
    </html>
  `);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/product-ingredients', productIngredientRoutes);
app.use('/api/stock', stockRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portu üzerinde çalışıyor`);
}); 