const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Miktar en az 1 olmalıdır'],
        },
        price: {
          type: Number,
          required: true,
        },
        notes: {
          type: String,
          trim: true,
        },
        status: {
          type: String,
          enum: ['beklemede', 'hazırlanıyor', 'hazır', 'servis edildi', 'iptal'],
          default: 'beklemede',
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['beklemede', 'onaylandı', 'hazırlanıyor', 'tamamlandı', 'iptal edildi'],
      default: 'beklemede',
    },
    paymentStatus: {
      type: String,
      enum: ['beklemede', 'kısmi ödeme', 'ödendi', 'iptal'],
      default: 'beklemede',
    },
    paymentMethod: {
      type: String,
      enum: ['nakit', 'kredi kartı', 'havale', 'diğer'],
      default: 'nakit',
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    orderType: {
      type: String,
      enum: ['masa', 'paket', 'gel-al'],
      default: 'masa',
    },
    deliveryAddress: {
      address: String,
      city: String,
      postalCode: String,
      phone: String,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statusHistory: {
      type: [{
        status: {
          type: String,
          required: true,
          enum: ['beklemede', 'onaylandı', 'hazırlanıyor', 'tamamlandı', 'iptal edildi']
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }],
      default: []
    },
  },
  { timestamps: true }
);

// Toplam tutarı hesaplama
orderSchema.methods.calculateTotalAmount = function () {
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  return this.totalAmount;
};

module.exports = mongoose.model('Order', orderSchema); 