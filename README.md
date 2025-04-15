# Restoran Yönetim Sistemi API

Restoran yönetim sistemi için geliştirilmiş kapsamlı bir REST API.

## Özellikler

- **Kullanıcı Yönetimi**: Kayıt, giriş, rol tabanlı yetkilendirme
- **Çoklu Firma Desteği**: Her firma için izole edilmiş veriler ve kullanıcılar
- **Masa Yönetimi**: Masaları ekleme, düzenleme, durum takibi
- **Menü Yönetimi**: Kategoriler, ürünler, fiyatlar
- **Sipariş Yönetimi**: Sipariş oluşturma, takip, güncelleme
- **Ödeme İşlemleri**: Sipariş ödemesi, fatura oluşturma
- **Stok Takibi**: Malzeme yönetimi, ürün-malzeme ilişkisi, stok hareketi
- **Bildirim Sistemi**: Önemli olaylar için bildirim oluşturma

## Teknolojiler

- **Node.js** - Sunucu tarafı JavaScript çalışma ortamı
- **Express** - Web framework
- **MongoDB** - NoSQL veritabanı
- **Mongoose** - MongoDB için ODM (Object Document Mapper)
- **JWT** - JSON Web Token tabanlı kimlik doğrulama
- **bcrypt** - Şifre hashleme

## Kurulum

### Gereksinimler

- Node.js (v14+)
- MongoDB (yerel veya Atlas)

### Adımlar

1. Projeyi klonlayın:

```bash
git clone https://github.com/melihcnz/restoran-api.git
cd restoran-api
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. `.env` dosyası oluşturun:

```bash
cp .env.example .env
```

4. `.env` dosyasındaki değişkenleri kendi ortamınıza göre düzenleyin.

5. Uygulamayı başlatın:

```bash
# Geliştirme modu
npm run dev

# Üretim modu
npm start
```

## Ortam Değişkenleri

Projenin kök dizininde bir `.env` dosyası oluşturun ve aşağıdaki değişkenleri ayarlayın:

```
# Server port
PORT=5000

# MongoDB Connection
# Local MongoDB
# MONGODB_URI=mongodb://localhost:27017/restoran-api

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@clustername.mongodb.net/?retryWrites=true&w=majority&appName=RestoranApi

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d

# API Configuration
NODE_ENV=development
# NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=*
```

> Not: 
> - Gerçek ortama geçerken `JWT_SECRET` değerini karmaşık ve güvenli bir değer ile değiştirin.
> - MongoDB Atlas kullanıyorsanız, `username`, `password` ve `clustername` değerlerini kendi bilgilerinizle değiştirin.

## Çoklu Firma Yapısı

Bu API, çoklu firma (multi-tenant) mimarisi ile tasarlanmıştır. Bu yapı şunları sağlar:

- Her firma kendi veri tabanında izole edilmiş şekilde çalışır
- Kullanıcılar belirli bir firmaya atanır ve sadece kendi firmasının verilerine erişebilir
- Süper yöneticiler tüm firmaların verilerini yönetebilir

### Firma Yapısı Özellikleri

- **Kullanıcı-Firma İlişkisi**: Her kullanıcı bir firmaya bağlıdır
- **Veri İzolasyonu**: Kategoriler, ürünler, masalar, siparişler, malzemeler ve stok verileri firma bazında ayrılmıştır
- **Rol Tabanlı Erişim**: Firma içinde farklı roller (admin, personel, kullanıcı) tanımlanabilir
- **Merkezi Yönetim**: Süper yöneticiler tüm firmaları ve kullanıcılarını yönetebilir

## API Dökümantasyonu

### Ana Endpointler

- **Kimlik Doğrulama**
  - `POST /api/auth/register` - Kullanıcı kaydı
  - `POST /api/auth/login` - Kullanıcı girişi

- **Firmalar**
  - `GET /api/companies` - Tüm firmaları listele (süper admin)
  - `POST /api/companies` - Yeni firma oluştur (süper admin)
  - `PUT /api/companies/:id` - Firma bilgilerini güncelle
  - `DELETE /api/companies/:id` - Firmayı sil

- **Kullanıcılar**
  - `GET /api/users` - Tüm kullanıcıları listele
  - `GET /api/users/:id` - Belirli bir kullanıcıyı getir
  - `PUT /api/users/:id` - Kullanıcı bilgilerini güncelle
  - `DELETE /api/users/:id` - Kullanıcıyı sil

- **Kategoriler**
  - `GET /api/categories` - Tüm kategorileri listele
  - `POST /api/categories` - Yeni kategori oluştur
  - `PUT /api/categories/:id` - Kategori güncelle
  - `DELETE /api/categories/:id` - Kategori sil

- **Ürünler**
  - `GET /api/products` - Tüm ürünleri listele
  - `GET /api/products/:id` - Belirli bir ürünü getir
  - `POST /api/products` - Yeni ürün oluştur
  - `PUT /api/products/:id` - Ürün güncelle
  - `DELETE /api/products/:id` - Ürün sil

- **Masalar**
  - `GET /api/tables` - Tüm masaları listele
  - `GET /api/tables/:id` - Belirli bir masayı getir
  - `POST /api/tables` - Yeni masa oluştur
  - `PUT /api/tables/:id` - Masa güncelle
  - `DELETE /api/tables/:id` - Masa sil

- **Siparişler**
  - `GET /api/orders` - Tüm siparişleri listele
  - `GET /api/orders/:id` - Belirli bir siparişi getir
  - `POST /api/orders` - Yeni sipariş oluştur
  - `PUT /api/orders/:id` - Sipariş güncelle
  - `DELETE /api/orders/:id` - Sipariş sil

- **Malzemeler**
  - `GET /api/ingredients` - Tüm malzemeleri listele
  - `GET /api/ingredients/:id` - Belirli bir malzemeyi getir
  - `POST /api/ingredients` - Yeni malzeme oluştur
  - `PUT /api/ingredients/:id` - Malzeme güncelle
  - `DELETE /api/ingredients/:id` - Malzeme sil
  - `GET /api/ingredients/low-stock` - Kritik stok seviyesindeki malzemeleri getir
  - `POST /api/ingredients/:id/stock-entry` - Stok girişi yap

- **Ürün-Malzeme İlişkisi**
  - `GET /api/product-ingredients/product/:productId` - Ürünün malzemelerini getir
  - `GET /api/product-ingredients/ingredient/:ingredientId` - Malzemeyi kullanan ürünleri getir
  - `POST /api/product-ingredients` - Ürüne malzeme ekle
  - `PUT /api/product-ingredients/:id` - Ürün-malzeme ilişkisini güncelle
  - `DELETE /api/product-ingredients/:id` - Ürün-malzeme ilişkisini sil

- **Stok İşlemleri**
  - `GET /api/stock/report` - Stok raporu al
  - `POST /api/stock/check-availability` - Sipariş için stok uygunluğunu kontrol et
  - `POST /api/stock/update-for-order/:orderId` - Sipariş için stok güncelle
  - `GET /api/stock/history` - Stok hareketlerini listele
  - `GET /api/stock/history/:ingredientId` - Belirli bir malzemenin stok geçmişini listele

## Stok Takip Sistemi

### Genel Bakış

Stok takip sistemi, restoran içindeki malzemelerin stok seviyelerini takip etmek ve sipariş süreçleriyle entegre çalışmak üzere tasarlanmıştır. Sistem şu şekilde çalışır:

1. **Malzemelerin Tanımlanması**: Her malzeme için ad, birim, maliyet, minimum stok seviyesi gibi bilgiler tanımlanır.

2. **Ürün-Malzeme İlişkisi**: Menüdeki her ürün için kullanılan malzemeler ve miktarları tanımlanır.

3. **Otomatik Stok Düşümü**: Siparişler tamamlandığında, siparişteki ürünlerin malzeme ihtiyaçları hesaplanır ve stoktan otomatik olarak düşülür.

4. **Stok Kontrolleri**: Yeni bir sipariş oluşturulurken, gerekli malzemelerin stokta olup olmadığı kontrol edilebilir.

5. **Stok Raporları**: Mevcut stok durumu, kritik stok seviyesindeki malzemeler ve stok hareketleri raporlanabilir.

6. **Bildirimler**: Malzeme stok seviyesi kritik seviyenin altına düştüğünde bildirim gönderilir.

### Kullanım Örneği

Örnek bir iş akışı:

1. Sistem yöneticisi, "Dana Kıyma" malzemesini 5kg stok ile tanımlar.
2. "Köfte" ürününe, her porsiyon için 200g "Dana Kıyma" kullanımı tanımlanır.
3. Müşteri 2 porsiyon köfte sipariş eder ve sipariş tamamlanır.
4. Sistem otomatik olarak 400g "Dana Kıyma" stoktan düşer (2 porsiyon × 200g).
5. Kalan stok miktarı 4.6kg olarak güncellenir.
6. Eğer stok kritik seviyenin altına düşerse, ilgili personele bildirim gönderilir.

## Lisans

MIT

## İletişim

Melih Canaz - mcanaz1234@gmail.com