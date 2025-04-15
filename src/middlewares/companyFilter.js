/**
 * Kullanıcının bağlı olduğu firma ID'sini sorgulara ekleyen middleware
 * Bu middleware, kullanıcıların sadece kendi firmalarına ait verilere erişmesini sağlar
 */
const companyFilter = (req, res, next) => {
  // Hata ayıklama için
  console.log('CompanyFilter çalışıyor...');
  
  // Kimlik doğrulanmış kullanıcı kontrolü
  console.log('Kullanıcı:', req.user ? `ID: ${req.user.id}, Role: ${req.user.role}` : 'Yok');
  console.log('Firma:', req.user && req.user.company ? `ID: ${req.user.company}` : 'Yok');
  
  // Koruma olmayan rotalar için kullanıcı bilgisi yoksa boş filtre ekle
  if (!req.user) {
    console.log('Kullanıcı bilgisi yok, boş filtre ekleniyor');
    req.companyFilter = {};
    return next();
  }
  
  // Süper admin kontrolü
  if (req.user.role === 'superadmin') {
    console.log('Süper admin, tüm verilere erişim sağlanıyor');
    req.companyFilter = {}; // Süper admin için filtre yok
    return next();
  }
  
  // Firma bilgisi kontrolü
  if (!req.user.company) {
    console.log('Kullanıcının firma bilgisi yok, erişim engelleniyor');
    // Artık erişime izin vermiyoruz
    return res.status(403).json({
      success: false,
      message: 'Firma bilgisi bulunamadı. Lütfen bir firmaya atanmak için yönetici ile iletişime geçin.',
    });
  }
  
  // Sorgu filtresi oluştur
  console.log(`Firma filtresi ekleniyor: ${req.user.company}`);
  req.companyFilter = { company: req.user.company };
  next();
};

module.exports = companyFilter; 