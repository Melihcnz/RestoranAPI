const Order = require('../models/order');
const Product = require('../models/product');
const Ingredient = require('../models/ingredient');
const ProductIngredient = require('../models/productIngredient');
const StockTransaction = require('../models/stockTransaction');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const { sendNotification } = require('../utils/notificationService');

/**
 * Tamamlanan sipariş için stok güncellemesi yapar
 * @param {String} orderId Sipariş ID'si
 * @param {String} userId İşlemi yapan kullanıcı ID'si
 */
exports.updateStockForCompletedOrder = async (orderId, userId) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Siparişi al
    const order = await Order.findById(orderId)
      .populate({
        path: 'items.product',
        model: 'Product'
      });
    
    if (!order) {
      throw new Error(`Sipariş bulunamadı: ${orderId}`);
    }
    
    // Kritik stok seviyesinde olan malzemeler
    const lowStockIngredients = [];
    
    // Sipariş öğelerini döngüye al
    for (const item of order.items) {
      const product = item.product;
      
      if (!product) {
        logger.warn(`Ürün bulunamadı, ürün ID: ${item.product}`);
        continue;
      }
      
      // Ürünün malzemelerini ProductIngredient koleksiyonundan al
      const productIngredients = await ProductIngredient.find({ product: product._id })
        .populate('ingredient');
      
      if (!productIngredients || productIngredients.length === 0) {
        logger.warn(`Ürün malzemeleri bulunamadı: ${product._id}`);
        continue;
      }
      
      // Her malzeme için stok güncelle
      for (const productIngredient of productIngredients) {
        const ingredient = productIngredient.ingredient;
        
        if (!ingredient) {
          logger.warn(`Malzeme bulunamadı: ${productIngredient.ingredient}`);
          continue;
        }
        
        // Toplam tüketilen miktar
        const consumedQuantity = productIngredient.quantity * item.quantity;
        const previousStock = ingredient.currentStock;
        const newStock = previousStock - consumedQuantity;
        
        // Stok güncelleme
        ingredient.currentStock = newStock;
        await ingredient.save({ session });
        
        // Stok hareketi oluştur
        await StockTransaction.create([{
          ingredient: ingredient._id,
          type: 'çıkış',
          quantity: consumedQuantity,
          previousStock,
          newStock,
          orderId,
          notes: `Sipariş #${order._id} tamamlandı`,
          performedBy: userId
        }], { session });
        
        // Düşük stok kontrolü
        if (newStock <= ingredient.minStockLevel) {
          lowStockIngredients.push({
            name: ingredient.name,
            currentStock: newStock,
            minimumStock: ingredient.minStockLevel
          });
        }
      }
    }
    
    await session.commitTransaction();
    
    // Kritik stok seviyesindeki malzemeler için bildirim gönder
    if (lowStockIngredients.length > 0) {
      const message = `${lowStockIngredients.length} malzeme kritik stok seviyesinin altına düştü`;
      const details = lowStockIngredients.map(ing => 
        `${ing.name}: ${ing.currentStock} (Min: ${ing.minimumStock})`
      ).join('\n');
      
      await sendNotification('stock', message, details);
    }
    
    return { success: true, lowStockIngredients };
    
  } catch (error) {
    await session.abortTransaction();
    logger.error('Sipariş tamamlama sırasında stok güncelleme hatası:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Sipariş için stok uygunluğunu kontrol eder
 * @param {Object} orderItems Sipariş öğeleri
 * @returns {Object} Stok uygunluk sonucu
 */
exports.checkStockAvailability = async (orderItems) => {
  try {
    const unavailableItems = [];
    
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        unavailableItems.push({
          product: item.product,
          name: item.name || 'Bilinmeyen ürün',
          reason: 'Ürün bulunamadı'
        });
        continue;
      }
      
      // Ürün malzemelerini al
      const productIngredients = await ProductIngredient.find({ product: product._id })
        .populate('ingredient');
      
      if (!productIngredients || productIngredients.length === 0) {
        continue; // Malzemesi olmayan ürün olabilir
      }
      
      // Yetersiz malzeme kontrolü
      for (const productIngredient of productIngredients) {
        const ingredient = productIngredient.ingredient;
        
        if (!ingredient) continue;
        
        const requiredAmount = productIngredient.quantity * item.quantity;
        
        if (ingredient.currentStock < requiredAmount) {
          unavailableItems.push({
            product: product._id,
            name: product.name,
            reason: `Yetersiz malzeme: ${ingredient.name} (Mevcut: ${ingredient.currentStock}, Gerekli: ${requiredAmount})`
          });
          break; // Bir malzeme yetersizse sonraki ürüne geç
        }
      }
    }
    
    return {
      available: unavailableItems.length === 0,
      unavailableItems
    };
    
  } catch (error) {
    logger.error('Stok uygunluk kontrolü sırasında hata:', error);
    throw error;
  }
};

/**
 * Stok raporu oluşturur
 * @param {Object} filters Filtreler
 * @returns {Object} Stok raporu
 */
exports.getStockReport = async (filters = {}) => {
  try {
    let query = {};
    
    // Kategori filtresi
    if (filters.category) {
      query.category = filters.category;
    }
    
    // Sadece düşük stok gösterme filtresi
    const checkLowStock = filters.onlyLowStock === true;
    
    // Tüm malzemeleri al
    let ingredients = await Ingredient.find(query)
      .populate('category', 'name')
      .sort({ name: 1 });
    
    // Düşük stok filtresi
    if (checkLowStock) {
      ingredients = ingredients.filter(ing => 
        ing.currentStock <= ing.minStockLevel
      );
    }
    
    // Toplam değer ve düşük stok sayısı
    let totalValue = 0;
    let lowStockCount = 0;
    
    ingredients.forEach(ing => {
      totalValue += ing.currentStock * ing.costPerUnit;
      
      if (ing.currentStock <= ing.minStockLevel) {
        lowStockCount++;
      }
    });
    
    return {
      ingredients,
      totalItems: ingredients.length,
      totalValue,
      lowStockCount,
      reportDate: new Date()
    };
    
  } catch (error) {
    logger.error('Stok raporu oluşturulurken hata:', error);
    throw error;
  }
}; 