# 🥐 ZeK: Görev Kavanozu & Kruvasan Krallığı

DEHB (ADHD) dostu, mobil öncelikli 16-bit aksiyonlu görev kavanozu, bahçe büyütme, kuş fotoğrafçılığı ve taş fırın oyunu!

## Özellikler
- **35 Görev Kavanozu**: Kavanozu çalkala, sürpriz görev çek veya kendi görevini ekle.
- **3 Kademeli Şef Zorluğu**:
  - 🥐 **Kruvasan (Kolay)**: +100 XP, +20 Altın Kruvasan, Normal Atış
  - 🥖 **Ekşi Maya (Orta)**: +250 XP, +45 Altın Kruvasan, Çift Kruvasan Atışı
  - 🎂 **Özel Tatlı (Zor)**: +500 XP, +90 Altın Kruvasan, Süper Kalkan + 3'lü Atış
- **Canlı Fırın Zamanlayıcısı & Ceza Sistemi**: Süre içinde bitmeyen görevlerde *"Hamur Yandı & Kargalar Bahçeyi Bastı"* cezası devreye girer. Bahçeyi kurtarmak için **Acil Bahçe Savunması** mini oyununu kazanabilir veya **5 Dakikalık Hızlı Telafi Görevi** yapabilirsin.
- **3 Aksiyon Mini-Oyunu**:
  1. **Kruvasan Protokolü**: 16-bit side-scroller koşu, çift zıplama, kuş fotoğraflama ve Boss savaşı.
  2. **Kuş Fotoğrafçısı Safarisi**: 12 nadir kuş türünü objektifle yakalama refleks oyunu.
  3. **Fırın & Bahçe Savunması**: 3 şeritli karga savunması ve Altın Fırın Dalgası.
- **Hibrit PWA**: iOS/Android telefonda "Ana Ekrana Ekle" ile tam ekran uygulama gibi çalışır.

## Kurulum & Yayınlama

### 1. GitHub Pages (Ücretsiz Statik Hosting)
1. Bu klasördeki tüm dosyaları GitHub depona yükle (`git push`).
2. Repo ayarlarından **Settings → Pages → Branch: main** seçeneğini aç.
3. Veriler telefonun tarayıcı hafızasında (`localStorage`) güvenle saklanır ve JSON yedekleme ile dışa/içe aktarılabilir.

### 2. Synology NAS — Web Station (En Kolay)
1. Dosyaları Synology'deki `/web/zek/` klasörüne kopyala.
2. Telefondan `http://SYNOLOGY_IP/zek/` adresini açıp Ana Ekrana Ekle.

### 3. Synology NAS — Container Manager / Docker (Otomatik Sunucu Yedeklemeli)
```bash
docker compose up -d --build
```
Sunucu `http://SYNOLOGY_IP:8080` portunda çalışır ve ilerlemeyi otomatik olarak `/zek-data/zek-state.json` dosyasına kaydeder.
