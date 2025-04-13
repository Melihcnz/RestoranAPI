const logger = require('./logger');

/**
 * Bildirim servisi
 * Sistem bildirimlerini kullanıcılara ve ilgili yerlere iletir
 * Bu basit bir implementasyondur, ileride gerçek zamanlı bildirimler için socket.io entegrasyonu eklenebilir
 */

/**
 * Bildirim gönderir
 * @param {String} type Bildirim tipi (stock, order, system vb.)
 * @param {String} message Bildirim mesajı
 * @param {String} details Detaylı bilgi
 * @param {Array} recipients Alıcılar (kullanıcı ID'leri, boş bırakılırsa admin rolüne gönderilir)
 */
exports.sendNotification = async (type, message, details, recipients = []) => {
  try {
    // Gerçek bir uygulamada bu bildirimler veritabanına kaydedilir
    // ve ilgili kullanıcılara iletilir
    
    // Burada basit olarak log'a yazıyoruz
    logger.info('Bildirim gönderildi', { 
      type, 
      message, 
      details, 
      recipients: recipients.length ? recipients : 'all admins' 
    });
    
    // TODO: Gerçek bir implementasyonda burada:
    // 1. Bildirim veritabanına kaydedilir
    // 2. Socket.io ile gerçek zamanlı bildirim gönderilir
    // 3. Gerekirse e-posta/SMS ile bildirim yapılır
    
    return {
      success: true,
      message: 'Bildirim gönderildi'
    };
  } catch (error) {
    logger.error('Bildirim gönderme hatası:', error);
    return {
      success: false,
      message: 'Bildirim gönderilemedi',
      error: error.message
    };
  }
};

/**
 * Stok bildirimi gönderir
 * @param {String} message Bildirim mesajı
 * @param {Object} data Bildirim verileri
 */
exports.sendStockNotification = async (message, data) => {
  return this.sendNotification('stock', message, data);
};

/**
 * Sipariş bildirimi gönderir
 * @param {String} message Bildirim mesajı
 * @param {Object} data Bildirim verileri
 */
exports.sendOrderNotification = async (message, data) => {
  return this.sendNotification('order', message, data);
};

/**
 * Sistem bildirimi gönderir
 * @param {String} message Bildirim mesajı
 * @param {Object} data Bildirim verileri
 */
exports.sendSystemNotification = async (message, data) => {
  return this.sendNotification('system', message, data);
}; 