const express = require('express');
const {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
} = require('../controllers/order');
const { protect, admin, staff } = require('../middlewares/auth');
const companyFilter = require('../middlewares/companyFilter');

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gerekli
router.use(protect);
router.use(companyFilter); // Firma filtresini ekle

router.route('/')
  .get(staff, getAllOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrder)
  .put(staff, updateOrder)
  .delete(admin, deleteOrder);

module.exports = router; 