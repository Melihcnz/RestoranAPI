const Product = require('../models/product');
const Category = require('../models/category');

// @desc    Tüm ürünleri getir
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    // Filtreleme
    let query = { ...req.companyFilter }; // Firma filtresini ekle
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.available !== undefined) {
      query.available = req.query.available === 'true';
    }
    
    if (req.query.featured !== undefined) {
      query.featured = req.query.featured === 'true';
    }
    
    // Arama
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    
    // Fiyat aralığı filtreleme
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      
      if (req.query.minPrice) {
        query.price.$gte = parseFloat(req.query.minPrice);
      }
      
      if (req.query.maxPrice) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      }
    }
    
    // Sayfalama için
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Toplam ürün sayısı
    const total = await Product.countDocuments(query);
    
    // Ürünleri getir
    const products = await Product.find(query)
      .populate('category', 'name')
      .skip(startIndex)
      .limit(limit)
      .sort(req.query.sort || '-createdAt');
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ürünler getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Tek ürün getir
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    // Firma filtresini ekle
    const query = { _id: req.params.id, ...req.companyFilter };
    
    const product = await Product.findOne(query).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ürün getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Ürün oluştur
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    // Kategori kontrolü
    const categoryExists = await Category.findOne({ 
      _id: req.body.category,
      ...req.companyFilter 
    });
    
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı',
      });
    }
    
    // Firma bilgisini ekle
    if (req.user && req.user.company) {
      req.body.company = req.user.company;
    }
    
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ürün oluşturulamadı',
      error: error.message,
    });
  }
};

// @desc    Ürün güncelle
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    // Kategori değişiyorsa kontrolü yap
    if (req.body.category) {
      const categoryExists = await Category.findOne({ 
        _id: req.body.category,
        ...req.companyFilter
      });
      
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Kategori bulunamadı',
        });
      }
    }
    
    // Firma filtresini ekle
    const query = { _id: req.params.id, ...req.companyFilter };
    
    let product = await Product.findOne(query);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı',
      });
    }
    
    product = await Product.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name');
    
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ürün güncellenemedi',
      error: error.message,
    });
  }
};

// @desc    Ürün sil
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    // Firma filtresini ekle
    const query = { _id: req.params.id, ...req.companyFilter };
    
    const product = await Product.findOne(query);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı',
      });
    }
    
    await product.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ürün silinemedi',
      error: error.message,
    });
  }
};

// @desc    Ürün durumunu güncelle (aktif/pasif)
// @route   PATCH /api/products/:id/availability
// @access  Private/Staff
exports.updateProductAvailability = async (req, res) => {
  try {
    const { available } = req.body;
    
    if (available === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen ürün durumunu belirtin',
      });
    }
    
    // Firma filtresini ekle
    const query = { _id: req.params.id, ...req.companyFilter };
    
    const product = await Product.findOneAndUpdate(
      query,
      { available },
      { new: true, runValidators: true }
    ).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ürün durumu güncellenemedi',
      error: error.message,
    });
  }
}; 