const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: [true, 'Masa numarası gereklidir'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Masa adı gereklidir'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Masa kapasitesi gereklidir'],
      min: [1, 'Masa kapasitesi en az 1 olmalıdır'],
    },
    status: {
      type: String,
      enum: ['boş', 'dolu', 'rezervasyonlu', 'bakımda'],
      default: 'boş',
    },
    section: {
      type: String,
      enum: ['iç mekan', 'dış mekan', 'vip', 'bar'],
      default: 'iç mekan',
    },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    qrCode: {
      type: String,
      default: '',
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: false, // Geriye dönük uyumluluk için false
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', tableSchema); 