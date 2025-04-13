const express = require('express');
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductAvailability,
} = require('../controllers/product');
const { protect, admin, staff } = require('../middlewares/auth');

const router = express.Router();

// Herkese açık rotalar
router.get('/', getAllProducts);
router.get('/:id', getProduct);

// Korumalı rotalar
router.use(protect);

// Staff rotaları
router.patch('/:id/availability', staff, updateProductAvailability);

// Admin rotaları
router.post('/', admin, createProduct);
router.put('/:id', admin, updateProduct);
router.delete('/:id', admin, deleteProduct);

module.exports = router; 