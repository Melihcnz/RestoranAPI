const mongoose = require('mongoose');

const productIngredientSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  ingredient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'lt', 'ml', 'adet', 'paket']
  },
  isOptional: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: false // Geriye dönük uyumluluk için false
  }
}, { timestamps: true });

// Ürün-Malzeme kombinasyonunun benzersiz olmasını sağla
productIngredientSchema.index({ product: 1, ingredient: 1 }, { unique: true });

module.exports = mongoose.model('ProductIngredient', productIngredientSchema); 