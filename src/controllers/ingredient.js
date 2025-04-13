const Ingredient = require('../models/ingredient');
const StockTransaction = require('../models/stockTransaction');
const ProductIngredient = require('../models/productIngredient');

// @desc    Tüm malzemeleri getir
// @route   GET /api/ingredients
// @access  Private/Staff
exports.getAllIngredients = async (req, res) => {
  try {
    // Filtreleme
    let query = {};
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.active !== undefined) {
      query.active = req.query.active === 'true';
    }
    
    if (req.query.lowStock === 'true') {
      query.$expr = { $lte: ['$currentStock', '$minStockLevel'] };
    }
    
    // Arama
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    
    // Sayfalama için
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Toplam malzeme sayısı
    const total = await Ingredient.countDocuments(query);
    
    // Malzemeleri getir
    const ingredients = await Ingredient.find(query)
      .populate('supplier', 'name')
      .skip(startIndex)
      .limit(limit)
      .sort(req.query.sort || 'name');
    
    res.status(200).json({
      success: true,
      count: ingredients.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: ingredients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Malzemeler getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Tek malzeme getir
// @route   GET /api/ingredients/:id
// @access  Private/Staff
exports.getIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id)
      .populate('supplier', 'name contactPerson phone');
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Malzeme bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Malzeme getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Malzeme oluştur
// @route   POST /api/ingredients
// @access  Private/Admin
exports.createIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.create(req.body);
    
    res.status(201).json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Malzeme oluşturulamadı',
      error: error.message,
    });
  }
};

// @desc    Malzeme güncelle
// @route   PUT /api/ingredients/:id
// @access  Private/Admin
exports.updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Malzeme bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Malzeme güncellenemedi',
      error: error.message,
    });
  }
};

// @desc    Malzeme sil
// @route   DELETE /api/ingredients/:id
// @access  Private/Admin
exports.deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Malzeme bulunamadı',
      });
    }
    
    // Bu malzemeyle ilişkili ürün var mı kontrol et
    const productIngredientCount = await ProductIngredient.countDocuments({ ingredient: req.params.id });
    
    if (productIngredientCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu malzeme ${productIngredientCount} üründe kullanılıyor, önce bu ilişkileri kaldırın`,
      });
    }
    
    await ingredient.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Malzeme silinemedi',
      error: error.message,
    });
  }
};

// @desc    Malzeme stok girişi
// @route   POST /api/ingredients/:id/stock-entry
// @access  Private/Staff
exports.addStockEntry = async (req, res) => {
  try {
    const { quantity, unitCost, supplier, notes } = req.body;
    
    const ingredient = await Ingredient.findById(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Malzeme bulunamadı',
      });
    }
    
    // Önceki stok
    const previousStock = ingredient.currentStock;
    // Yeni stok
    const newStock = previousStock + quantity;
    // Toplam maliyet
    const totalCost = quantity * unitCost;
    
    // Malzeme stok güncelleme
    await Ingredient.findByIdAndUpdate(req.params.id, { 
      currentStock: newStock,
      costPerUnit: unitCost // İsteğe bağlı: son birim maliyeti güncelle
    });
    
    // Stok hareket kaydı oluştur
    const transaction = await StockTransaction.create({
      ingredient: req.params.id,
      type: 'giriş',
      quantity,
      previousStock,
      newStock,
      unitCost,
      totalCost,
      supplier,
      notes,
      performedBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Stok girişi yapılamadı',
      error: error.message,
    });
  }
};

// @desc    Kritik stok seviyesindeki malzemeleri getir
// @route   GET /api/ingredients/low-stock
// @access  Private/Staff
exports.getLowStockIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({
      $expr: { $lte: ['$currentStock', '$minStockLevel'] }
    }).populate('supplier', 'name contactPerson phone');
    
    res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kritik stok seviyesindeki malzemeler getirilemedi',
      error: error.message,
    });
  }
}; 