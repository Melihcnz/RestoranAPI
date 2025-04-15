const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockTransactionSchema = new Schema({
  ingredient: {
    type: Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['giriş', 'çıkış', 'düzeltme', 'envanter']
  },
  quantity: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  supplierOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'SupplierOrder'
  },
  notes: {
    type: String
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: false // Geriye dönük uyumluluk için false
  }
}, { timestamps: true });

// Endeksleme
stockTransactionSchema.index({ ingredient: 1 });
stockTransactionSchema.index({ type: 1 });
stockTransactionSchema.index({ createdAt: 1 });

module.exports = mongoose.model('StockTransaction', stockTransactionSchema); 