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
const companyFilter = require('../middlewares/companyFilter');

const router = express.Router();

// Tüm rotalar için kimlik doğrulama ve firma filtresi gerekli
router.use(protect);
router.use(companyFilter);

// Genel erişim rotaları (kimlik doğrulaması ile)
router.get('/', getAllProducts);
router.get('/:id', getProduct);

// Staff rotaları
router.patch('/:id/availability', staff, updateProductAvailability);

// Admin rotaları
router.post('/', admin, createProduct);
router.put('/:id', admin, updateProduct);
router.delete('/:id', admin, deleteProduct);

module.exports = router; 