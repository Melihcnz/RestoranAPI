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

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

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