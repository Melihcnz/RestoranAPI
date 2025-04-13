const Category = require('../models/category');
const Product = require('../models/product');

// @desc    Tüm kategorileri getir
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
  try {
    // Filtreleme
    let query = {};
    
    if (req.query.active !== undefined) {
      query.active = req.query.active === 'true';
    }
    
    // Kategorileri getir
    const categories = await Category.find(query).sort({ order: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategoriler getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Tek kategori getir
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategori getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Kategori oluştur
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategori oluşturulamadı',
      error: error.message,
    });
  }
};

// @desc    Kategori güncelle
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategori güncellenemedi',
      error: error.message,
    });
  }
};

// @desc    Kategori sil
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı',
      });
    }
    
    // Kategoride ürün varsa silme
    const productCount = await Product.countDocuments({ category: req.params.id });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu kategoride ${productCount} ürün bulunuyor, önce ürünleri silin veya taşıyın`,
      });
    }
    
    await category.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategori silinemedi',
      error: error.message,
    });
  }
}; 