const express = require('express');
const router = express.Router();
const productIngredientController = require('../controllers/productIngredient');
const { protect, admin, staff } = require('../middlewares/auth');
const companyFilter = require('../middlewares/companyFilter');

// Rota /api/product-ingredients prefix'i ile çağırılacak

// Tüm rotalar için kimlik doğrulama ve firma filtresi gerekli
router.use(protect);
router.use(companyFilter);

// Bir ürünün malzemelerini getir
router.get(
  '/product/:productId',
  staff,
  productIngredientController.getIngredientsByProduct
);

// Bir malzemenin kullanıldığı ürünleri getir
router.get(
  '/ingredient/:ingredientId',
  staff,
  productIngredientController.getProductsByIngredient
);

// Temel CRUD işlemleri
router
  .route('/')
  .post(admin, productIngredientController.createProductIngredient);

router
  .route('/:id')
  .put(admin, productIngredientController.updateProductIngredient)
  .delete(admin, productIngredientController.deleteProductIngredient);

module.exports = router; 