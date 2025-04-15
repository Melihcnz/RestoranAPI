const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Kullanıcı girişi doğrulama
exports.protect = async (req, res, next) => {
  // Hata ayıklama için
  console.log('Auth middleware çalışıyor...');
  console.log('Headers:', req.headers.authorization ? 'Authorization header var' : 'Authorization header yok');
  
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Token'ı al
      token = req.headers.authorization.split(' ')[1];
      console.log('Token alındı');

      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token doğrulandı, kullanıcı ID:', decoded.id);

      // Kullanıcıyı bul (şifre olmadan) ve firma bilgisini ekle
      req.user = await User.findById(decoded.id)
        .select('-password')
        .populate('company', 'name');

      if (!req.user) {
        console.log('Kullanıcı bulunamadı!');
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı bulunamadı',
        });
      }

      console.log(`Kullanıcı bulundu: ${req.user.name}, Firma: ${req.user.company ? req.user.company.name : 'Yok'}`);
      next();
    } catch (error) {
      console.error('Token doğrulama hatası:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Yetkisiz erişim, geçersiz token',
      });
    }
  } else {
    console.log('Token bulunamadı');
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