const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Firma adı gereklidir'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: [true, 'İletişim e-postası gereklidir'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Lütfen geçerli bir email adresi giriniz',
      ],
    },
    contactPhone: {
      type: String,
      match: [
        /^(\+90|0)?[0-9]{10}$/,
        'Lütfen geçerli bir telefon numarası giriniz',
      ],
    },
    logo: {
      type: String,
      default: 'no-logo.jpg',
    },
    active: {
      type: Boolean,
      default: true,
    },
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic',
    },
    settings: {
      currency: {
        type: String,
        default: 'TRY',
      },
      taxRate: {
        type: Number,
        default: 18,
      },
      language: {
        type: String,
        default: 'tr',
      },
      timeZone: {
        type: String,
        default: 'Europe/Istanbul',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema); 