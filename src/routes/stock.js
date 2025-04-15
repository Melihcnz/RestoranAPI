const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock');
const { protect, admin, staff } = require('../middlewares/auth');
const companyFilter = require('../middlewares/companyFilter');

// Rota /api/stock prefix'i ile çağırılacak

// Tüm rotalar için kimlik doğrulama ve firma filtresi gerekli
router.use(protect);
router.use(companyFilter);

// Stok raporu oluşturma
router.get(
  '/report',
  staff,
  stockController.getStockReport
);

// Sipariş için stok uygunluğunu kontrol etme
router.post(
  '/check-availability',
  staff,
  stockController.checkStockAvailability
);

// Sipariş tamamlandığında stok düşme işlemi
router.post(
  '/update-for-order/:orderId',
  staff,
  stockController.updateStockForOrder
);

// Stok geçmişi
router.get(
  '/history',
  admin,
  stockController.getStockHistory
);

// Malzeme bazında stok geçmişi
router.get(
  '/history/:ingredientId',
  staff,
  stockController.getIngredientStockHistory
);

module.exports = router; 