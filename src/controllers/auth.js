const User = require('../models/user');

// @desc    Kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Email kullanımda mı kontrolü
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kayıtlı',
      });
    }

    // Kullanıcı oluşturma
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      phone,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı kaydı başarısız',
      error: error.message,
    });
  }
};

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen email ve şifre giriniz',
      });
    }

    // Kullanıcıyı şifresiyle birlikte bul
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre',
      });
    }

    // Şifre doğrulama
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre',
      });
    }

    // Kullanıcı aktif değilse
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız pasif durumdadır, lütfen yönetici ile iletişime geçin',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Giriş başarısız',
      error: error.message,
    });
  }
};

// @desc    Mevcut kullanıcı bilgilerini getir
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri alınamadı',
      error: error.message,
    });
  }
};

// @desc    Çıkış yap
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Başarıyla çıkış yapıldı',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Çıkış yapılamadı',
      error: error.message,
    });
  }
};

// Token oluşturma ve cookie olarak gönderme
const sendTokenResponse = (user, statusCode, res) => {
  // Token oluştur
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}; 