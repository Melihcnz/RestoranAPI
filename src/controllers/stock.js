const StockTransaction = require('../models/stockTransaction');
const stockService = require('../services/stockService');
const ingredientService = require('../services/ingredientService');

// @desc    Stok raporu almak
// @route   GET /api/stock/report
// @access  Private/Admin/Staff
exports.getStockReport = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      onlyLowStock: req.query.lowStock === 'true'
    };
    
    const report = await stockService.getStockReport(filters, req.companyFilter);
    
    res.status(200).json({
      success: true,
      ...report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Stok raporu oluşturulamadı',
      error: error.message
    });
  }
};

// @desc    Sipariş için stok kontrolü yapmak
// @route   POST /api/stock/check-availability
// @access  Private/Admin/Staff
exports.checkStockAvailability = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli sipariş öğeleri gereklidir'
      });
    }
    
    const result = await stockService.checkStockAvailability(items);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Stok kontrolü yapılamadı',
      error: error.message
    });
  }
};

// @desc    Sipariş için stok güncelleme (tamamlandı durumunda)
// @route   POST /api/stock/update-for-order/:orderId
// @access  Private/Admin/Staff
exports.updateStockForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Sipariş ID gereklidir'
      });
    }
    
    const result = await stockService.updateStockForCompletedOrder(orderId, req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Stok başarıyla güncellendi',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Stok güncellemesi başarısız',
      error: error.message
    });
  }
};

// @desc    Genel stok geçmişi getir
// @route   GET /api/stock/history
// @access  Private/Admin
exports.getStockHistory = async (req, res) => {
  try {
    const query = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 20,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      type: req.query.type
    };
    
    const skip = (query.page - 1) * query.limit;
    
    let dbQuery = { ...req.companyFilter };
    
    // Tarih aralığına göre filtreleme
    if (query.startDate && query.endDate) {
      dbQuery.createdAt = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate)
      };
    }
    
    // İşlem tipine göre filtreleme
    if (query.type && ['giriş', 'çıkış', 'düzeltme', 'envanter'].includes(query.type)) {
      dbQuery.type = query.type;
    }
    
    // Stok hareketlerini getir
    const transactions = await StockTransaction.find(dbQuery)
      .populate('ingredient', 'name unit category')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit);
    
    // Toplam sayıyı hesapla
    const total = await StockTransaction.countDocuments(dbQuery);
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit)
      },
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Stok geçmişi getirilemedi',
      error: error.message
    });
  }
};

// @desc    Malzeme bazında stok geçmişi getir
// @route   GET /api/stock/history/:ingredientId
// @access  Private/Admin/Staff
exports.getIngredientStockHistory = async (req, res) => {
  try {
    const { ingredientId } = req.params;
    
    const query = {
      limit: parseInt(req.query.limit, 10) || 20,
      skip: parseInt(req.query.skip, 10) || 0,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      type: req.query.type
    };
    
    const result = await ingredientService.getIngredientStockHistory(ingredientId, query, req.companyFilter);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Malzeme stok geçmişi getirilemedi',
      error: error.message
    });
  }
}; 