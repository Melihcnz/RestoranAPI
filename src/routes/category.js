const express = require('express');
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category');
const { protect, admin } = require('../middlewares/auth');

const router = express.Router();

// Herkese açık rotalar
router.get('/', getAllCategories);
router.get('/:id', getCategory);

// Admin rotaları
router.use(protect);
router.use(admin);

router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router; 