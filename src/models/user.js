const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lütfen isim giriniz'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Lütfen email giriniz'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Lütfen geçerli bir email adresi giriniz',
      ],
    },
    password: {
      type: String,
      required: [true, 'Lütfen şifre giriniz'],
      minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'staff', 'admin'],
      default: 'user',
    },
    phone: {
      type: String,
      match: [
        /^(\+90|0)?[0-9]{10}$/,
        'Lütfen geçerli bir telefon numarası giriniz',
      ],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Şifreyi hashleme
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// JWT token oluşturma
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Şifre karşılaştırma
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 