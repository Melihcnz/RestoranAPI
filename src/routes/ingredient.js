const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredient');
const { protect, admin, staff } = require('../middlewares/auth');

// Rota /api/ingredients prefix'i ile çağırılacak

// Düşük stok seviyesindeki malzemeleri getir
router.get(
  '/low-stock',
  protect,
  staff,
  ingredientController.getLowStockIngredients
);

// Temel CRUD işlemleri
router
  .route('/')
  .get(protect, staff, ingredientController.getAllIngredients)
  .post(protect, admin, ingredientController.createIngredient);

router
  .route('/:id')
  .get(protect, staff, ingredientController.getIngredient)
  .put(protect, admin, ingredientController.updateIngredient)
  .delete(protect, admin, ingredientController.deleteIngredient);

// Stok giriş işlemi
router.post(
  '/:id/stock-entry',
  protect,
  staff,
  ingredientController.addStockEntry
);

module.exports = router; 