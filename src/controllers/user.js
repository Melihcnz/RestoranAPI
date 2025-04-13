const User = require('../models/user');

// @desc    Tüm kullanıcıları getir
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    // Sayfalama için
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Filtreleme
    let query = {};
    
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    if (req.query.active !== undefined) {
      query.active = req.query.active === 'true';
    }
    
    // Toplam kullanıcı sayısı
    const total = await User.countDocuments(query);
    
    // Kullanıcıları getir
    const users = await User.find(query)
      .select('-password')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Tek kullanıcı getir
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Kullanıcı güncelle
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    // Güncellenecek alanları belirle
    const updates = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      phone: req.body.phone,
      active: req.body.active,
    };
    
    // Şifre güncellemesi varsa
    if (req.body.password) {
      // Şifreyi doğrudan güncellemeye çalışma, model middleware'ini tetiklemek için
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı',
        });
      }
      
      user.password = req.body.password;
      await user.save();
      
      // Şifre hariç diğer alanları güncelle
      delete updates.password;
      await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });
    } else {
      // Sadece diğer alanları güncelle
      await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });
    }
    
    const updatedUser = await User.findById(req.params.id).select('-password');
    
    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı güncellenemedi',
      error: error.message,
    });
  }
};

// @desc    Kullanıcı sil
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }
    
    // Admin kendisini silmeye çalışıyorsa engelle
    if (user._id.toString() === req.user.id && user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Kendi hesabınızı silemezsiniz',
      });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinemedi',
      error: error.message,
    });
  }
};