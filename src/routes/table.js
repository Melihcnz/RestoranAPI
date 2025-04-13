const express = require('express');
const {
  getAllTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
} = require('../controllers/table');
const { protect, admin, staff } = require('../middlewares/auth');

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gerekli
router.use(protect);

router.route('/')
  .get(getAllTables)
  .post(admin, createTable);

router.route('/:id')
  .get(getTable)
  .put(admin, updateTable)
  .delete(admin, deleteTable);

router.patch('/:id/status', staff, updateTableStatus);

module.exports = router; 