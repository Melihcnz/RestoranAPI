# Restoran Yönetim Sistemi API

Restoran yönetim sistemi için geliştirilmiş kapsamlı bir REST API.

## Özellikler

- **Kullanıcı Yönetimi**: Giriş, kayıt, rol tabanlı yetkilendirme (admin, personel, müşteri)
- **Masa Yönetimi**: Masa durumları, kapasite, bölümler
- **Sipariş Sistemi**: Masa ve paket siparişleri, ödeme durumu takibi
- **Ürün Yönetimi**: Kategoriler, fiyatlar, stok durumu
- **Raporlama**: Satış, sipariş ve müşteri analizleri

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# .env dosyasını yapılandır
cp .env.example .env

# Geliştirme modunda çalıştır
npm run dev

# Üretim modunda çalıştır
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

## API Dökümantasyonu

### Kimlik Doğrulama

- `POST /api/auth/register` - Yeni kullanıcı kaydı
  ```json
  {
    "name": "Melih Canaz",
    "email": "melih@gmail.com",
    "password": "123456",
    "role": "admin", // "admin", "staff", "user"
    "phone": "05551234567"
  }
  ```

- `POST /api/auth/login` - Kullanıcı girişi
  ```json
  {
    "email": "melih@gmail.com",
    "password": "123456"
  }
  ```
  Yanıt olarak JWT token döner:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67fb722e26b6351b71a858a7",
      "name": "Melih Canaz",
      "email": "melih@gmail.com",
      "role": "admin"
    }
  }
  ```

- `GET /api/auth/me` - Mevcut kullanıcı bilgisi
- `GET /api/auth/logout` - Çıkış yap

### Kullanıcılar

- `GET /api/users` - Tüm kullanıcıları listele (Admin)
  - Filtreleme: `?role=staff&active=true&page=1&limit=10`

- `GET /api/users/:id` - Tek kullanıcı bilgisi (Admin)

- `PUT /api/users/:id` - Kullanıcı güncelle (Admin)
  ```json
  {
    "name": "Yeni İsim",
    "email": "yeni@gmail.com",
    "role": "staff",
    "phone": "05559876543",
    "active": true,
    "password": "yenisifre" // İsteğe bağlı
  }
  ```

- `DELETE /api/users/:id` - Kullanıcı sil (Admin)

### Masalar

- `GET /api/tables` - Tüm masaları listele
  - Filtreleme: `?status=boş&section=iç mekan&active=true`

- `GET /api/tables/:id` - Tek masa bilgisi

- `POST /api/tables` - Yeni masa ekle (Admin)
  ```json
  {
    "number": 1,
    "name": "Pencere Kenarı 1",
    "capacity": 4,
    "section": "iç mekan", // "iç mekan", "dış mekan", "vip", "bar"
    "status": "boş" // İsteğe bağlı, varsayılan "boş"
  }
  ```

- `PUT /api/tables/:id` - Masa güncelle (Admin)
  ```json
  {
    "name": "VIP Masa 1",
    "capacity": 6,
    "section": "vip"
  }
  ```

- `DELETE /api/tables/:id` - Masa sil (Admin)

- `PATCH /api/tables/:id/status` - Masa durumunu güncelle (Personel)
  ```json
  {
    "status": "dolu" // "boş", "dolu", "rezervasyonlu", "bakımda"
  }
  ```

### Kategoriler

- `GET /api/categories` - Tüm kategorileri listele
  - Filtreleme: `?active=true`

- `GET /api/categories/:id` - Tek kategori bilgisi

- `POST /api/categories` - Yeni kategori ekle (Admin)
  ```json
  {
    "name": "Ana Yemekler",
    "description": "Ana yemekler kategorisi",
    "image": "anayemekler.jpg", // İsteğe bağlı
    "order": 1 // Sıralama için, isteğe bağlı
  }
  ```

- `PUT /api/categories/:id` - Kategori güncelle (Admin)
  ```json
  {
    "name": "Tatlılar",
    "description": "Tatlılar kategorisi",
    "active": true
  }
  ```

- `DELETE /api/categories/:id` - Kategori sil (Admin)

### Ürünler

- `GET /api/products` - Tüm ürünleri listele
  - Filtreleme: `?category=67fb732726b6351b71a858ab&available=true&featured=true&search=köfte&minPrice=20&maxPrice=100&page=1&limit=10&sort=-createdAt`

- `GET /api/products/:id` - Tek ürün bilgisi

- `POST /api/products` - Yeni ürün ekle (Admin)
  ```json
  {
    "name": "Köfte",
    "description": "Izgara köfte",
    "price": 50,
    "category": "67fb732726b6351b71a858ab", // Kategori ID'si
    "preparationTime": 15, // Dakika cinsinden
    "ingredients": [
      {
        "name": "Dana kıyma",
        "optional": false
      },
      {
        "name": "Baharatlar",
        "optional": false
      }
    ],
    "allergens": ["gluten", "süt"],
    "available": true,
    "featured": false,
    "discount": 0 // Yüzde olarak indirim
  }
  ```

- `PUT /api/products/:id` - Ürün güncelle (Admin)
  ```json
  {
    "name": "Özel Köfte",
    "price": 60,
    "discount": 10
  }
  ```

- `DELETE /api/products/:id` - Ürün sil (Admin)

- `PATCH /api/products/:id/availability` - Ürün durumunu güncelle (Personel)
  ```json
  {
    "available": false // true/false
  }
  ```

### Siparişler

- `GET /api/orders` - Tüm siparişleri listele (Personel)
  - Filtreleme: `?status=beklemede&paymentStatus=beklemede&orderType=masa&table=67fb74e426b6351b71a858c1&customer=67fb722e26b6351b71a858a7&startDate=2025-04-01&endDate=2025-04-30&page=1&limit=10`

- `GET /api/orders/:id` - Tek sipariş bilgisi

- `POST /api/orders` - Yeni sipariş oluştur
  ```json
  {
    "table": "67fb74e426b6351b71a858c1", // Masa ID'si (masa siparişi için)
    "items": [
      {
        "product": "67fb73bc26b6351b71a858b0", // Ürün ID'si
        "quantity": 2,
        "notes": "Az baharatlı"
      }
    ],
    "orderType": "masa", // "masa", "paket", "gel-al"
    "specialRequests": "Hızlı servis",
    "deliveryAddress": { // Paket sipariş için
      "address": "Örnek Mah. 123 Sk. No:45",
      "city": "İstanbul",
      "postalCode": "34100",
      "phone": "05551234567"
    }
  }
  ```

- `PUT /api/orders/:id` - Sipariş güncelle (Personel)
  ```json
  {
    "status": "tamamlandı", // "beklemede", "onaylandı", "hazırlanıyor", "tamamlandı", "iptal edildi"
    "paymentStatus": "ödendi", // "beklemede", "kısmi ödeme", "ödendi", "iptal"
    "paymentMethod": "kredi kartı", // "nakit", "kredi kartı", "havale", "diğer"
    "items": [
      {
        "product": "67fb73bc26b6351b71a858b0",
        "quantity": 3,
        "notes": "Acılı olsun",
        "status": "hazırlanıyor" // "beklemede", "hazırlanıyor", "hazır", "servis edildi", "iptal"
      }
    ]
  }
  ```
  
  **Not**: Sipariş "tamamlandı" veya "iptal edildi" olarak işaretlendiğinde, ilgili masa otomatik olarak "boş" durumuna güncellenir.

- `DELETE /api/orders/:id` - Sipariş sil (Admin)

## Veri Modelleri

### Kullanıcı (User)
```javascript
{
  name: String, // Zorunlu
  email: String, // Zorunlu, benzersiz
  password: String, // Zorunlu, min 6 karakter
  role: String, // "user", "staff", "admin"
  phone: String,
  active: Boolean // true/false
}
```

### Masa (Table)
```javascript
{
  number: Number, // Zorunlu, benzersiz
  name: String, // Zorunlu
  capacity: Number, // Zorunlu, min 1
  status: String, // "boş", "dolu", "rezervasyonlu", "bakımda"
  section: String, // "iç mekan", "dış mekan", "vip", "bar"
  currentOrder: ObjectId, // Masa üzerindeki aktif sipariş
  active: Boolean, // true/false
  qrCode: String
}
```

### Kategori (Category)
```javascript
{
  name: String, // Zorunlu, benzersiz
  description: String,
  image: String,
  active: Boolean, // true/false
  order: Number // Sıralama için
}
```

### Ürün (Product)
```javascript
{
  name: String, // Zorunlu
  description: String,
  price: Number, // Zorunlu, min 0
  image: String,
  category: ObjectId, // Zorunlu, Category referansı
  preparationTime: Number, // Dakika cinsinden
  ingredients: [
    {
      name: String, // Zorunlu
      optional: Boolean // true/false
    }
  ],
  allergens: [String],
  available: Boolean, // true/false
  featured: Boolean, // true/false
  discount: Number // Yüzde olarak, 0-100 arası
}
```

### Sipariş (Order)
```javascript
{
  table: ObjectId, // Table referansı
  customer: ObjectId, // User referansı
  items: [
    {
      product: ObjectId, // Zorunlu, Product referansı
      quantity: Number, // Zorunlu, min 1
      price: Number, // Zorunlu
      notes: String,
      status: String // "beklemede", "hazırlanıyor", "hazır", "servis edildi", "iptal"
    }
  ],
  totalAmount: Number, // Zorunlu
  status: String, // "beklemede", "onaylandı", "hazırlanıyor", "tamamlandı", "iptal edildi"
  paymentStatus: String, // "beklemede", "kısmi ödeme", "ödendi", "iptal"
  paymentMethod: String, // "nakit", "kredi kartı", "havale", "diğer"
  specialRequests: String,
  orderType: String, // "masa", "paket", "gel-al"
  deliveryAddress: {
    address: String,
    city: String,
    postalCode: String,
    phone: String
  },
  staff: ObjectId // User referansı
}
```

## Postman'da API Testleri

### Adım 1: Kullanıcı Kaydı ve Giriş
1. **Kullanıcı Kaydı**:
   - POST `http://localhost:5000/api/auth/register`
   - Body: Yukarıda gösterilen kullanıcı modeli

2. **Kullanıcı Girişi**:
   - POST `http://localhost:5000/api/auth/login`
   - Body: `{ "email": "...", "password": "..." }`
   - Dönen token'ı kaydedin!

3. **Auth Header Ayarı**:
   - Postman'de Authorization sekmesi
   - Type: Bearer Token
   - Token: Login'den gelen token

### Adım 2: Kategori ve Ürün İşlemleri
1. **Kategori Oluşturma**:
   - POST `http://localhost:5000/api/categories`
   - Body: Yukarıda gösterilen kategori modeli

2. **Ürün Oluşturma**:
   - POST `http://localhost:5000/api/products`
   - Body: Yukarıda gösterilen ürün modeli

### Adım 3: Masa ve Sipariş İşlemleri
1. **Masa Oluşturma**:
   - POST `http://localhost:5000/api/tables`
   - Body: Yukarıda gösterilen masa modeli

2. **Sipariş Oluşturma**:
   - POST `http://localhost:5000/api/orders`
   - Body: Yukarıda gösterilen sipariş modeli

3. **Sipariş Durumu Güncelleme**:
   - PUT `http://localhost:5000/api/orders/:id`
   - Body: `{ "status": "tamamlandı", "paymentStatus": "ödendi" }`

## Teknolojiler

- **Node.js**: Sunucu tarafı çalışma ortamı
- **Express**: Web framework
- **MongoDB**: Veritabanı
- **Mongoose**: MongoDB ODM
- **JWT**: Kullanıcı kimlik doğrulama
- **Bcrypt**: Şifre hashleme

## Lisans

MIT