const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ürün adı gereklidir'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Ürün fiyatı gereklidir'],
      min: [0, 'Fiyat negatif olamaz'],
    },
    image: {
      type: String,
      default: 'no-image.jpg',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Kategori gereklidir'],
    },
    preparationTime: {
      type: Number,
      default: 15, // dakika cinsinden
    },
    ingredients: [
      {
        name: {
          type: String,
          required: true,
        },
        optional: {
          type: Boolean,
          default: false,
        },
      },
    ],
    allergens: [String],
    available: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: false, // Geriye dönük uyumluluk için false
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema); 