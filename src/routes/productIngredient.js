const express = require('express');
const router = express.Router();
const productIngredientController = require('../controllers/productIngredient');
const { protect, admin, staff } = require('../middlewares/auth');

// Rota /api/product-ingredients prefix'i ile çağırılacak

// Bir ürünün malzemelerini getir
router.get(
  '/product/:productId',
  protect,
  staff,
  productIngredientController.getIngredientsByProduct
);

// Bir malzemenin kullanıldığı ürünleri getir
router.get(
  '/ingredient/:ingredientId',
  protect,
  staff,
  productIngredientController.getProductsByIngredient
);

// Temel CRUD işlemleri
router
  .route('/')
  .post(protect, admin, productIngredientController.createProductIngredient);

router
  .route('/:id')
  .put(protect, admin, productIngredientController.updateProductIngredient)
  .delete(protect, admin, productIngredientController.deleteProductIngredient);

module.exports = router; 