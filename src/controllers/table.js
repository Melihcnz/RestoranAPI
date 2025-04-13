const Table = require('../models/table');
const Order = require('../models/order');

// @desc    Tüm masaları getir
// @route   GET /api/tables
// @access  Private
exports.getAllTables = async (req, res) => {
  try {
    // Filtreleme
    let query = {};
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.section) {
      query.section = req.query.section;
    }
    
    if (req.query.active !== undefined) {
      query.active = req.query.active === 'true';
    }
    
    // Tüm masaları getir
    const tables = await Table.find(query)
      .sort({ number: 1 })
      .populate('currentOrder');
    
    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Masalar getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Tek masa getir
// @route   GET /api/tables/:id
// @access  Private
exports.getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate('currentOrder');
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Masa bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Masa getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Masa oluştur
// @route   POST /api/tables
// @access  Private/Admin
exports.createTable = async (req, res) => {
  try {
    // Aynı numarada masa var mı kontrol et
    const existingTable = await Table.findOne({ number: req.body.number });
    
    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: 'Bu masa numarası zaten kullanılıyor',
      });
    }
    
    const table = await Table.create(req.body);
    
    res.status(201).json({
      success: true,
      data: table,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Masa oluşturulamadı',
      error: error.message,
    });
  }
};

// @desc    Masa güncelle
// @route   PUT /api/tables/:id
// @access  Private/Admin
exports.updateTable = async (req, res) => {
  try {
    let table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Masa bulunamadı',
      });
    }
    
    // Masa numarası değişiyorsa, yeni numara kullanılıyor mu kontrol et
    if (req.body.number && req.body.number !== table.number) {
      const existingTable = await Table.findOne({ number: req.body.number });
      
      if (existingTable) {
        return res.status(400).json({
          success: false,
          message: 'Bu masa numarası zaten kullanılıyor',
        });
      }
    }
    
    table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Masa güncellenemedi',
      error: error.message,
    });
  }
};

// @desc    Masa sil
// @route   DELETE /api/tables/:id
// @access  Private/Admin
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Masa bulunamadı',
      });
    }
    
    // Masanın aktif siparişi varsa silme
    if (table.currentOrder) {
      return res.status(400).json({
        success: false,
        message: 'Bu masanın aktif siparişi var, önce siparişi kapatın',
      });
    }
    
    await table.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Masa silinemedi',
      error: error.message,
    });
  }
};

// @desc    Masa durumunu güncelle
// @route   PATCH /api/tables/:id/status
// @access  Private/Staff
exports.updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen durum belirtin',
      });
    }
    
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Masa bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Masa durumu güncellenemedi',
      error: error.message,
    });
  }
}; 