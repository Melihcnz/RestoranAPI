const express = require('express');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/user');
const { protect, admin } = require('../middlewares/auth');

const router = express.Router();

// Tüm rotalar için kimlik doğrulama ve admin yetkisi gerekli
router.use(protect);
router.use(admin);

router.route('/').get(getAllUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router; 