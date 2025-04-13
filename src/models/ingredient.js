const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Malzeme adı gereklidir'],
      trim: true,
      unique: true
    },
    currentStock: {
      type: Number,
      required: [true, 'Mevcut stok miktarı gereklidir'],
      min: 0
    },
    unit: {
      type: String,
      required: [true, 'Birim gereklidir'],
      enum: ['kg', 'g', 'lt', 'ml', 'adet', 'paket']
    },
    minStockLevel: {
      type: Number,
      required: [true, 'Minimum stok seviyesi gereklidir'],
      min: 0
    },
    costPerUnit: {
      type: Number,
      required: [true, 'Birim maliyet gereklidir'],
      min: 0
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: false
    },
    category: {
      type: String,
      enum: ['et', 'sebze', 'meyve', 'süt ürünü', 'baharat', 'kuru gıda', 'içecek', 'diğer'],
      required: true
    },
    expiryDate: {
      type: Date,
      required: false
    },
    location: {
      type: String,
      required: false
    },
    active: {
      type: Boolean,
      default: true
    }
  }, 
  { timestamps: true }
);

// Son kullanma tarihi yaklaşan malzemeleri hesapla
ingredientSchema.methods.isExpiringSoon = function() {
  if (!this.expiryDate) return false;
  
  const today = new Date();
  const daysUntilExpiry = Math.ceil((this.expiryDate - today) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 7; // 7 gün veya daha az kaldıysa
};

// Kritik stok seviyesinde mi?
ingredientSchema.methods.isLowStock = function() {
  return this.currentStock <= this.minStockLevel;
};

module.exports = mongoose.model('Ingredient', ingredientSchema); 