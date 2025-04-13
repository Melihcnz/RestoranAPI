const Order = require('../models/order');
const Table = require('../models/table');
const Product = require('../models/product');
const stockService = require('../services/stockService');

// @desc    Tüm siparişleri getir
// @route   GET /api/orders
// @access  Private/Staff
exports.getAllOrders = async (req, res) => {
  try {
    // Filtreleme
    let query = {};
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }
    
    if (req.query.orderType) {
      query.orderType = req.query.orderType;
    }
    
    if (req.query.table) {
      query.table = req.query.table;
    }
    
    if (req.query.customer) {
      query.customer = req.query.customer;
    }
    
    // Tarih aralığı filtreleme
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.createdAt = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.createdAt = { $lte: new Date(req.query.endDate) };
    }
    
    // Sayfalama için
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Toplam sipariş sayısı
    const total = await Order.countDocuments(query);
    
    // Siparişleri getir
    const orders = await Order.find(query)
      .populate([
        { path: 'table', select: 'number name section' },
        { path: 'customer', select: 'name email phone' },
        { path: 'staff', select: 'name' },
        { path: 'items.product', select: 'name price category' }
      ])
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Siparişler getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Tek sipariş getir
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate([
        { path: 'table', select: 'number name section' },
        { path: 'customer', select: 'name email phone' },
        { path: 'staff', select: 'name' },
        { path: 'items.product', select: 'name price category' }
      ]);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sipariş getirilemedi',
      error: error.message,
    });
  }
};

// @desc    Sipariş oluştur
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { table: tableId, items, orderType, specialRequests, deliveryAddress } = req.body;
    
    // Masa kontrolü
    if (orderType === 'masa' && !tableId) {
      return res.status(400).json({
        success: false,
        message: 'Masa siparişi için masa ID gereklidir',
      });
    }
    
    // Paket sipariş kontrolü
    if (orderType === 'paket' && !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Paket sipariş için adres bilgisi gereklidir',
      });
    }
    
    // Sipariş ürünleri kontrolü
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sipariş en az bir ürün içermelidir',
      });
    }
    
    // Ürünleri veritabanından al ve fiyatları kontrol et
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Ürün bulunamadı: ${item.product}`,
        });
      }
      
      if (!product.available) {
        return res.status(400).json({
          success: false,
          message: `${product.name} ürünü şu anda mevcut değil`,
        });
      }
      
      // İndirimli fiyat hesaplama
      const discountedPrice = product.discount 
        ? product.price - (product.price * product.discount / 100) 
        : product.price;
      
      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price: discountedPrice,
        notes: item.notes || '',
      });
    }
    
    // Sipariş oluştur
    const order = new Order({
      table: tableId,
      customer: req.user.id,
      items: orderItems,
      totalAmount: 0, // Hesaplama için geçici değer
      specialRequests,
      orderType: orderType || 'masa',
      deliveryAddress,
      staff: req.user.role === 'staff' || req.user.role === 'admin' ? req.user.id : null,
    });
    
    // Toplam tutarı hesapla
    order.calculateTotalAmount();
    
    // Siparişi kaydet
    await order.save();
    
    // Masa durumunu güncelle
    if (tableId) {
      await Table.findByIdAndUpdate(tableId, {
        status: 'dolu',
        currentOrder: order._id,
      });
    }
    
    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sipariş oluşturulamadı',
      error: error.message,
    });
  }
};

// @desc    Sipariş güncelle
// @route   PUT /api/orders/:id
// @access  Private/Staff
exports.updateOrder = async (req, res) => {
  try {
    const { status, paymentStatus, paymentMethod, items } = req.body;
    
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı',
      });
    }
    
    // Sipariş tamamlandı veya iptal edildiyse güncellenemez
    if (order.status === 'tamamlandı' || order.status === 'iptal edildi') {
      return res.status(400).json({
        success: false,
        message: `${order.status} durumundaki sipariş güncellenemez`,
      });
    }
    
    // Güncelleme işlemi
    const updates = {};
    
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (paymentMethod) updates.paymentMethod = paymentMethod;
    
    // Ürün güncelleme işlemi
    if (items && items.length > 0) {
      // Mevcut ürünler korunur, yenileri eklenir
      const updatedItems = [...order.items];
      
      for (const item of items) {
        const product = await Product.findById(item.product);
        
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Ürün bulunamadı: ${item.product}`,
          });
        }
        
        if (!product.available) {
          return res.status(400).json({
            success: false,
            message: `${product.name} ürünü şu anda mevcut değil`,
          });
        }
        
        // İndirimli fiyat hesaplama
        const discountedPrice = product.discount 
          ? product.price - (product.price * product.discount / 100) 
          : product.price;
        
        // Mevcut ürün var mı kontrol et
        const existingItemIndex = updatedItems.findIndex(
          i => i.product.toString() === item.product.toString()
        );
        
        if (existingItemIndex > -1) {
          // Mevcut ürünü güncelle
          updatedItems[existingItemIndex].quantity = item.quantity;
          updatedItems[existingItemIndex].notes = item.notes || '';
          
          if (item.status) {
            updatedItems[existingItemIndex].status = item.status;
          }
        } else {
          // Yeni ürün ekle
          updatedItems.push({
            product: item.product,
            quantity: item.quantity,
            price: discountedPrice,
            notes: item.notes || '',
            status: item.status || 'beklemede',
          });
        }
      }
      
      updates.items = updatedItems;
      
      // Toplam tutarı yeniden hesapla
      order.items = updatedItems;
      updates.totalAmount = order.calculateTotalAmount();
    }
    
    // Order status changes
    if (status && status !== order.status) {
      // statusHistory null veya undefined olabilir, kontrol edelim
      const currentHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];
      
      updates.statusHistory = [
        ...currentHistory,
        {
          status,
          timestamp: Date.now(),
          user: req.user.id,
        },
      ];
    }
    
    // Siparişi güncelle
    order = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'table', select: 'number name section' },
      { path: 'customer', select: 'name email phone' },
      { path: 'staff', select: 'name' },
      { path: 'items.product', select: 'name price category' }
    ]);
    
    // Sipariş tamamlandı veya iptal edildiyse masayı güncelle
    if ((status === 'tamamlandı' || status === 'iptal edildi') && order.table) {
      await Table.findByIdAndUpdate(order.table, {
        status: 'boş',
        currentOrder: null,
      });
    }
    
    // Sipariş tamamlandıysa stok güncellemesi yap
    if (status === 'tamamlandı') {
      try {
        await stockService.updateStockForCompletedOrder(order._id, req.user.id);
      } catch (stockError) {
        console.error('Stok güncelleme hatası:', stockError);
        
        // Stok hatası olsa bile siparişi güncelle ama uyarı ver
        return res.status(200).json({
          success: true,
          data: order,
          warning: 'Sipariş güncellendi ancak stok güncellemesi sırasında hata oluştu: ' + stockError.message
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sipariş güncellenemedi',
      error: error.message,
    });
  }
};

// @desc    Sipariş sil
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı',
      });
    }
    
    // Eğer sipariş bir masaya aitse masa durumunu güncelle
    if (order.table) {
      await Table.findByIdAndUpdate(order.table, {
        status: 'boş',
        currentOrder: null,
      });
    }
    
    await order.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sipariş silinemedi',
      error: error.message,
    });
  }
}; 