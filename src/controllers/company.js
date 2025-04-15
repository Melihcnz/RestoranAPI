const Company = require('../models/company');
const User = require('../models/user');

// @desc    Firma oluştur
// @route   POST /api/companies
// @access  Private/SuperAdmin
exports.createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);
    
    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Firma oluşturulamadı',
      error: error.message,
    });
  }
};

// @desc    Tüm firmaları getir
// @route   GET /api/companies
// @access  Private/SuperAdmin
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    
    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Firmalar getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Tek firma getir
// @route   GET /api/companies/:id
// @access  Private/SuperAdmin
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Firma bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Firma getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Firma güncelle
// @route   PUT /api/companies/:id
// @access  Private/SuperAdmin
exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Firma bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Firma güncellenemedi',
      error: error.message,
    });
  }
};

// @desc    Firma sil
// @route   DELETE /api/companies/:id
// @access  Private/SuperAdmin
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Firma bulunamadı',
      });
    }
    
    // Bu firmaya bağlı kullanıcılar var mı kontrol et
    const userCount = await User.countDocuments({ company: req.params.id });
    
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu firmaya bağlı ${userCount} kullanıcı bulunuyor. Önce kullanıcıları başka bir firmaya aktarın veya silin.`,
      });
    }
    
    await company.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Firma silinemedi',
      error: error.message,
    });
  }
};

// @desc    Kullanıcıyı firma ile ilişkilendir
// @route   PUT /api/companies/:id/users/:userId
// @access  Private/SuperAdmin
exports.assignUserToCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Firma bulunamadı',
      });
    }
    
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }
    
    user.company = company._id;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Kullanıcı firmaya atandı',
      data: {
        userId: user._id,
        companyId: company._id,
        companyName: company.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı firmaya atanamadı',
      error: error.message,
    });
  }
}; 