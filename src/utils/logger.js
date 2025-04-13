/**
 * Basit bir logger implementasyonu
 * Daha gelişmiş bir logger için winston, bunyan gibi kütüphaneler kullanılabilir
 */

// Logger seviyeleri
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Geçerli log seviyesi (default: info)
const currentLevel = process.env.LOG_LEVEL || 'info';

// Timestamp oluşturan yardımcı fonksiyon
const getTimestamp = () => {
  return new Date().toISOString();
};

// Log formatını düzenleyen fonksiyon
const formatLog = (level, message, meta = {}) => {
  const timestamp = getTimestamp();
  let formattedMeta = '';
  
  if (Object.keys(meta).length > 0) {
    formattedMeta = JSON.stringify(meta);
  }
  
  return `[${timestamp}] [${level.toUpperCase()}]: ${message} ${formattedMeta}`;
};

// Verilen seviyede log oluşturmayı sağlayan fonksiyon
const log = (level, message, meta = {}) => {
  if (levels[level] <= levels[currentLevel]) {
    const formattedLog = formatLog(level, message, meta);
    
    switch(level) {
      case 'error':
        console.error(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'info':
        console.info(formattedLog);
        break;
      case 'debug':
        console.debug(formattedLog);
        break;
      default:
        console.log(formattedLog);
    }
  }
};

// Logger arayüzü
const logger = {
  error: (message, meta = {}) => log('error', message, meta),
  warn: (message, meta = {}) => log('warn', message, meta),
  info: (message, meta = {}) => log('info', message, meta),
  debug: (message, meta = {}) => log('debug', message, meta)
};

module.exports = logger; 