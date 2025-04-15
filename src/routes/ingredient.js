const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredient');
const { protect, admin, staff } = require('../middlewares/auth');
const companyFilter = require('../middlewares/companyFilter');

// Rota /api/ingredients prefix'i ile çağırılacak

// Tüm rotalar için kimlik doğrulama ve firma filtresi gerekli
router.use(protect);
router.use(companyFilter);

// Düşük stok seviyesindeki malzemeleri getir
router.get(
  '/low-stock',
  staff,
  ingredientController.getLowStockIngredients
);

// Temel CRUD işlemleri
router
  .route('/')
  .get(staff, ingredientController.getAllIngredients)
  .post(admin, ingredientController.createIngredient);

router
  .route('/:id')
  .get(staff, ingredientController.getIngredient)
  .put(admin, ingredientController.updateIngredient)
  .delete(admin, ingredientController.deleteIngredient);

// Stok giriş işlemi
router.post(
  '/:id/stock-entry',
  staff,
  ingredientController.addStockEntry
);

module.exports = router; 