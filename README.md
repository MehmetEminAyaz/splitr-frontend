# Splitr Frontend

Splitr, arkadaşlarınızla, ailenizle veya iş arkadaşlarınızla harcamalarınızı adil bir şekilde bölüştürmenizi sağlayan modern bir web uygulamasıdır.

## Özellikler

- 🏠 **Landing Page**: Modern ve çekici ana sayfa
- 🔐 **Kullanıcı Yönetimi**: Kayıt olma ve giriş yapma
- 👥 **Grup Yönetimi**: Grup oluşturma ve üye davet etme
- 💰 **Harcama Takibi**: Grup içinde harcama ekleme ve takip etme
- 💳 **Ödeme Yönetimi**: Grup üyeleri arasında ödeme kaydetme
- ⚖️ **Bakiye Hesaplama**: Otomatik borç-alacak hesaplama
- 📱 **Responsive Tasarım**: Mobil ve masaüstü uyumlu

## Teknolojiler

- **React 19** - Modern UI kütüphanesi
- **React Router** - Sayfa yönlendirme
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **JWT Decode** - Token yönetimi
- **Vite** - Build tool

## Kurulum

### Gereksinimler

- Node.js (v18 veya üzeri)
- npm veya yarn
- Splitr Backend API (http://localhost:8080)

### Adımlar

1. **Projeyi klonlayın**
   ```bash
   git clone <repository-url>
   cd splitr-frontend
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Geliştirme sunucusunu başlatın**
   ```bash
   npm run dev
   ```

4. **Tarayıcıda açın**
   ```
   http://localhost:5173
   ```

## API Bağlantısı

Uygulama varsayılan olarak `http://localhost:8080` adresindeki backend API'sine bağlanır. API URL'sini değiştirmek için `src/services/api.js` dosyasındaki `API_BASE_URL` değişkenini güncelleyin.

## Kullanım

### 1. Kayıt Olma
- Ana sayfadan "Kayıt Ol" butonuna tıklayın
- Ad, soyad, e-posta ve şifre bilgilerinizi girin
- Hesabınız otomatik olarak oluşturulur ve giriş yapılır

### 2. Grup Oluşturma
- Dashboard'da "Yeni Grup Oluştur" butonuna tıklayın
- Grup adını girin ve oluşturun

### 3. Harcama Ekleme
- Grup detay sayfasında "Harcamalar" sekmesine gidin
- "Harcama Ekle" butonuna tıklayın
- Başlık, tutar ve dahil olan üyeleri seçin

### 4. Ödeme Kaydetme
- "Ödemeler" sekmesinde "Ödeme Ekle" butonuna tıklayın
- Tutar ve alıcıyı seçin

### 5. Bakiye Görüntüleme
- "Bakiyeler" sekmesinde kim kime ne kadar borçlu olduğunu görün

## Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── LandingPage.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── GroupDetail.jsx
│   └── ProtectedRoute.jsx
├── context/            # React Context
│   └── AuthContext.jsx
├── services/           # API servisleri
│   └── api.js
├── App.jsx            # Ana uygulama bileşeni
├── main.jsx           # Uygulama giriş noktası
└── App.css            # Stil dosyası
```

## Build

Production build için:

```bash
npm run build
```

Build dosyaları `dist/` klasöründe oluşturulur.

## Geliştirme

### Kod Stili
- ESLint kullanılıyor
- Prettier formatı takip ediliyor
- Component'ler PascalCase
- Fonksiyonlar camelCase

### Yeni Özellik Ekleme
1. Yeni component'i `src/components/` klasörüne ekleyin
2. Gerekirse API servisini `src/services/api.js`'e ekleyin
3. Route'u `src/App.jsx`'e ekleyin
4. Test edin

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## İletişim

Sorularınız için issue açabilir veya pull request gönderebilirsiniz.
