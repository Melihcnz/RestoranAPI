const express = require('express');
const {
  createCompany,
  getAllCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
  assignUserToCompany,
} = require('../controllers/company');
const { protect, admin } = require('../middlewares/auth');

// Süper admin middleware
const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için süper admin yetkisi gereklidir',
    });
  }
};

const router = express.Router();

// Tüm rotalar korumalı ve süper admin yetkisi gerektirir
router.use(protect);
router.use(superAdmin);

router.route('/')
  .get(getAllCompanies)
  .post(createCompany);

router.route('/:id')
  .get(getCompany)
  .put(updateCompany)
  .delete(deleteCompany);

router.put('/:id/users/:userId', assignUserToCompany);

module.exports = router; 