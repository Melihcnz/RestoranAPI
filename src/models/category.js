const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Kategori adı gereklidir'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: 'no-image.jpg',
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema); 