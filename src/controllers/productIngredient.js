const ProductIngredient = require('../models/productIngredient');
const Product = require('../models/product');
const Ingredient = require('../models/ingredient');

// @desc    Ürün için malzemeleri getir
// @route   GET /api/product-ingredients/product/:productId
// @access  Private/Staff
exports.getIngredientsByProduct = async (req, res) => {
  try {
    const productIngredients = await ProductIngredient.find({ product: req.params.productId })
      .populate('ingredient', 'name currentStock unit minStockLevel category')
      .populate('product', 'name');
    
    res.status(200).json({
      success: true,
      count: productIngredients.length,
      data: productIngredients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ürün malzemeleri getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Malzeme için ürünleri getir
// @route   GET /api/product-ingredients/ingredient/:ingredientId
// @access  Private/Staff
exports.getProductsByIngredient = async (req, res) => {
  try {
    const productIngredients = await ProductIngredient.find({ ingredient: req.params.ingredientId })
      .populate('product', 'name price category')
      .populate('ingredient', 'name');
    
    res.status(200).json({
      success: true,
      count: productIngredients.length,
      data: productIngredients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Malzemeyi kullanan ürünler getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Ürün-Malzeme ilişkisi oluştur
// @route   POST /api/product-ingredients
// @access  Private/Admin
exports.createProductIngredient = async (req, res) => {
  try {
    const { product, ingredient, quantity, unit, isOptional, notes } = req.body;
    
    // Ürün var mı kontrol et
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı',
      });
    }
    
    // Malzeme var mı kontrol et
    const ingredientExists = await Ingredient.findById(ingredient);
    if (!ingredientExists) {
      return res.status(404).json({
        success: false,
        message: 'Malzeme bulunamadı',
      });
    }
    
    // Aynı ürün-malzeme ilişkisi var mı kontrol et
    const existingRelation = await ProductIngredient.findOne({ product, ingredient });
    if (existingRelation) {
      return res.status(400).json({
        success: false,
        message: 'Bu ürün-malzeme ilişkisi zaten var',
      });
    }
    
    // İlişki oluştur
    const productIngredient = await ProductIngredient.create({
      product,
      ingredient,
      quantity,
      unit,
      isOptional,
      notes
    });
    
    res.status(201).json({
      success: true,
      data: productIngredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ürün-malzeme ilişkisi oluşturulamadı',
      error: error.message,
    });
  }
};

// @desc    Ürün-Malzeme ilişkisi güncelle
// @route   PUT /api/product-ingredients/:id
// @access  Private/Admin
exports.updateProductIngredient = async (req, res) => {
  try {
    const productIngredient = await ProductIngredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('ingredient', 'name')
     .populate('product', 'name');
    
    if (!productIngredient) {
      return res.status(404).json({
        success: false,
        message: 'Ürün-malzeme ilişkisi bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      data: productIngredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ürün-malzeme ilişkisi güncellenemedi',
      error: error.message,
    });
  }
};

// @desc    Ürün-Malzeme ilişkisi sil
// @route   DELETE /api/product-ingredients/:id
// @access  Private/Admin
exports.deleteProductIngredient = async (req, res) => {
  try {
    const productIngredient = await ProductIngredient.findById(req.params.id);
    
    if (!productIngredient) {
      return res.status(404).json({
        success: false,
        message: 'Ürün-malzeme ilişkisi bulunamadı',
      });
    }
    
    await productIngredient.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ürün-malzeme ilişkisi silinemedi',
      error: error.message,
    });
  }
}; 