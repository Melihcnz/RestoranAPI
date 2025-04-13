const Ingredient = require('../models/ingredient');
const StockTransaction = require('../models/stockTransaction');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * Tüm malzemeleri listeler
 * @param {Object} query Sorgu parametreleri
 * @returns {Array} Malzeme listesi
 */
exports.getAllIngredients = async (query = {}) => {
  try {
    let findQuery = {};
    
    // İsime göre arama
    if (query.search) {
      findQuery.name = { $regex: query.search, $options: 'i' };
    }
    
    // Kategoriye göre filtreleme
    if (query.category) {
      findQuery.category = query.category;
    }
    
    // Kritik stok seviyesinde olanları filtreleme
    if (query.lowStock === 'true') {
      findQuery.$expr = { $lte: ['$currentStock', '$minimumStock'] };
    }
    
    const sortField = query.sortBy || 'name';
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    
    const ingredients = await Ingredient.find(findQuery)
      .populate('category', 'name')
      .sort({ [sortField]: sortOrder });
      
    return ingredients;
  } catch (error) {
    logger.error('Malzemeleri listelerken hata:', error);
    throw error;
  }
};

/**
 * Belirli bir malzemeyi getirir
 * @param {String} id Malzeme ID'si
 * @returns {Object} Malzeme
 */
exports.getIngredientById = async (id) => {
  try {
    const ingredient = await Ingredient.findById(id)
      .populate('category', 'name');
      
    if (!ingredient) {
      throw new Error(`ID'si ${id} olan malzeme bulunamadı`);
    }
    
    return ingredient;
  } catch (error) {
    logger.error(`Malzeme bulunurken hata: ${id}`, error);
    throw error;
  }
};

/**
 * Yeni malzeme oluşturur
 * @param {Object} ingredientData Malzeme bilgileri
 * @param {String} userId İşlemi yapan kullanıcı ID'si
 * @returns {Object} Oluşturulan malzeme
 */
exports.createIngredient = async (ingredientData, userId) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Oluşturulacak malzeme verileri
    const newIngredientData = {
      name: ingredientData.name,
      category: ingredientData.category,
      unit: ingredientData.unit,
      unitCost: ingredientData.unitCost || 0,
      currentStock: ingredientData.initialStock || 0,
      minimumStock: ingredientData.minimumStock || 0,
      description: ingredientData.description || '',
      isActive: ingredientData.isActive !== false
    };
    
    // Malzemeyi oluştur
    const ingredient = await Ingredient.create([newIngredientData], { session });
    const createdIngredient = ingredient[0];
    
    // Başlangıç stoğu için stok hareketi oluştur
    if (ingredientData.initialStock && ingredientData.initialStock > 0) {
      await StockTransaction.create([{
        ingredient: createdIngredient._id,
        type: 'giriş',
        quantity: ingredientData.initialStock,
        previousStock: 0,
        newStock: ingredientData.initialStock,
        notes: 'Malzeme oluşturulurken ilk stok girişi',
        performedBy: userId
      }], { session });
    }
    
    await session.commitTransaction();
    return createdIngredient;
  } catch (error) {
    await session.abortTransaction();
    logger.error('Malzeme oluşturulurken hata:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Malzeme günceller
 * @param {String} id Malzeme ID'si
 * @param {Object} updateData Güncellenecek veriler
 * @param {String} userId İşlemi yapan kullanıcı ID'si
 * @returns {Object} Güncellenmiş malzeme
 */
exports.updateIngredient = async (id, updateData, userId) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Mevcut malzemeyi bul
    const ingredient = await Ingredient.findById(id);
    
    if (!ingredient) {
      throw new Error(`ID'si ${id} olan malzeme bulunamadı`);
    }
    
    // Stok miktarı değişimi kontrolü
    const previousStock = ingredient.currentStock;
    const newStock = updateData.currentStock !== undefined ? 
      parseFloat(updateData.currentStock) : previousStock;
    
    // Stok değişimi varsa işlem oluştur
    if (newStock !== previousStock) {
      const stockChange = newStock - previousStock;
      const type = stockChange > 0 ? 'düzeltme' : 'düzeltme';
      
      await StockTransaction.create([{
        ingredient: id,
        type,
        quantity: Math.abs(stockChange),
        previousStock,
        newStock,
        notes: 'Malzeme güncellemesi sırasında stok düzeltmesi',
        performedBy: userId
      }], { session });
    }
    
    // Malzemeyi güncelle
    Object.keys(updateData).forEach(key => {
      ingredient[key] = updateData[key];
    });
    
    await ingredient.save({ session });
    await session.commitTransaction();
    
    return ingredient;
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Malzeme güncellenirken hata: ${id}`, error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Malzeme stok durumunu günceller
 * @param {String} id Malzeme ID'si
 * @param {Number} quantity Miktar
 * @param {String} type İşlem tipi (giriş, çıkış, düzeltme, envanter)
 * @param {String} userId İşlemi yapan kullanıcı ID'si
 * @param {Object} options Ek seçenekler (notes, supplierOrderId)
 * @returns {Object} Güncellenmiş malzeme
 */
exports.updateIngredientStock = async (id, quantity, type, userId, options = {}) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Malzemeyi bul
    const ingredient = await Ingredient.findById(id);
    
    if (!ingredient) {
      throw new Error(`ID'si ${id} olan malzeme bulunamadı`);
    }
    
    const previousStock = ingredient.currentStock;
    let newStock = previousStock;
    
    // İşlem tipine göre stok güncelleme
    switch (type) {
      case 'giriş':
        newStock = previousStock + quantity;
        break;
      case 'çıkış':
        newStock = previousStock - quantity;
        if (newStock < 0) {
          throw new Error(`Stok yetersiz. Mevcut: ${previousStock}, Çıkış: ${quantity}`);
        }
        break;
      case 'düzeltme':
      case 'envanter':
        newStock = quantity; // Doğrudan yeni değer atanıyor
        break;
      default:
        throw new Error(`Geçersiz işlem tipi: ${type}`);
    }
    
    // Stok hareketini oluştur
    await StockTransaction.create([{
      ingredient: id,
      type,
      quantity: type === 'düzeltme' || type === 'envanter' ? Math.abs(newStock - previousStock) : quantity,
      previousStock,
      newStock,
      supplierOrderId: options.supplierOrderId,
      notes: options.notes || `Manuel stok ${type}`,
      performedBy: userId
    }], { session });
    
    // Malzeme stoğunu güncelle
    ingredient.currentStock = newStock;
    await ingredient.save({ session });
    
    await session.commitTransaction();
    return ingredient;
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Stok güncellenirken hata: ${id}`, error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Malzeme stok geçmişini getirir
 * @param {String} id Malzeme ID'si
 * @param {Object} query Sorgu parametreleri
 * @returns {Object} Stok geçmişi
 */
exports.getIngredientStockHistory = async (id, query = {}) => {
  try {
    let findQuery = { ingredient: id };
    
    // Tarih aralığı filtresi
    if (query.startDate && query.endDate) {
      findQuery.createdAt = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate)
      };
    }
    
    // İşlem tipi filtresi
    if (query.type && ['giriş', 'çıkış', 'düzeltme', 'envanter'].includes(query.type)) {
      findQuery.type = query.type;
    }
    
    const limit = parseInt(query.limit) || 50;
    const skip = parseInt(query.skip) || 0;
    
    const transactions = await StockTransaction.find(findQuery)
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await StockTransaction.countDocuments(findQuery);
    
    return {
      transactions,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > skip + limit
      }
    };
  } catch (error) {
    logger.error(`Stok geçmişi alınırken hata: ${id}`, error);
    throw error;
  }
}; 