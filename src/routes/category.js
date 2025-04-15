const express = require('express');
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category');
const { protect, admin } = require('../middlewares/auth');
const companyFilter = require('../middlewares/companyFilter');

const router = express.Router();

// Tüm rotalar için önce kimlik doğrulama ve firma filtreleme
router.use(protect);
router.use(companyFilter);

// Genel rotalar (tüm kullanıcılar)
router.get('/', getAllCategories);
router.get('/:id', getCategory);

// Admin rotaları
router.post('/', admin, createCategory);
router.put('/:id', admin, updateCategory);
router.delete('/:id', admin, deleteCategory);

module.exports = router; 