const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tedarikçi adı gereklidir'],
      trim: true
    },
    contactPerson: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Telefon numarası gereklidir']
    },
    email: {
      type: String,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta giriniz']
    },
    address: {
      type: String
    },
    productCategories: [String],
    isActive: {
      type: Boolean,
      default: true
    },
    notes: String
  }, 
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema); 