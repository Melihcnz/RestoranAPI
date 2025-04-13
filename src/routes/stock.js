const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock');
const { protect, admin, staff } = require('../middlewares/auth');

// Rota /api/stock prefix'i ile çağırılacak

// Stok raporu oluşturma
router.get(
  '/report',
  protect,
  staff,
  stockController.getStockReport
);

// Sipariş için stok uygunluğunu kontrol etme
router.post(
  '/check-availability',
  protect,
  staff,
  stockController.checkStockAvailability
);

// Sipariş tamamlandığında stok düşme işlemi
router.post(
  '/update-for-order/:orderId',
  protect,
  staff,
  stockController.updateStockForOrder
);

// Stok geçmişi
router.get(
  '/history',
  protect,
  admin,
  stockController.getStockHistory
);

// Malzeme bazında stok geçmişi
router.get(
  '/history/:ingredientId',
  protect,
  staff,
  stockController.getIngredientStockHistory
);

module.exports = router; 