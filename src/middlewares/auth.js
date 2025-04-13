const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Kullanıcı girişi doğrulama
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Token'ı al
      token = req.headers.authorization.split(' ')[1];

      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kullanıcıyı bul (şifre olmadan)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        message: 'Yetkisiz erişim, geçersiz token',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Yetkisiz erişim, token bulunamadı',
    });
  }
};

// Admin rolü kontrolü
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için admin yetkisi gereklidir',
    });
  }
};

// Personel rolü kontrolü
exports.staff = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için personel yetkisi gereklidir',
    });
  }
}; 