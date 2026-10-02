# Codevra Discord Sunucu Kopyalama

Discord sunucu kopyalama scripti.

## Özellikler

- Roller (izinler, renkler, ayarlar)
- Kategoriler (izinlerle birlikte)
- Metin kanalları (topic, slowmode, NSFW)
- Sesli kanallar (bitrate, kullanıcı limiti)
- Kanal izinleri
- Detaylı loglama
- Hata yönetimi
- Onay sistemi

## Gereksinimler

- Python 3.7+
- Discord hesabı (self token)
- Her iki sunucuda da bulunma

## Kurulum

Windows:
```
start.bat
```

Manuel:
```
pip install -r requirements.txt
python main.py
```

## Kullanım

1. Programı başlat
2. Kopyalanacak sunucu ID'sini gir (kaynak)
3. Aktarılacak sunucu ID'sini gir (hedef - temizlenecek)
4. Discord token'ını gir
5. Onayla ve bekle

## Token Nasıl Alınır

1. Discord'u tarayıcıda aç (discord.com/app)
2. F12 tuşuna bas
3. Console sekmesine git
4. Şu kodu yapıştır:

```javascript
(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()
```

5. Çıkan token'ı kopyala

## Sunucu ID Nasıl Alınır

1. Discord ayarlarından "Geliştirici Modu"nu aç
2. Sunucuya sağ tıkla
3. "Sunucu ID'sini Kopyala" seçeneğine tıkla

## Önemli Notlar

- Self-bot kullanımı Discord ToS'a aykırıdır
- Token'ınızı kimseyle paylaşmayın
- Hedef sunucu tamamen temizlenecektir
- Bot'a Administrator yetkisi verin
- İşlem biraz zaman alabilir

## Güvenlik

Bu script tamamen açık kaynaklıdır ve virüs içermez.

Dosyalar:
- main.py - Ana program
- function.py - Kopyalama fonksiyonları
- requirements.txt - Gerekli paketler

## Sorun Giderme

"Giriş başarısız" hatası:
- Token'ınızı kontrol edin
- Token'ın geçerli olduğundan emin olun

"Sunucu bulunamadı" hatası:
- Sunucu ID'lerini kontrol edin
- Hesabınızın her iki sunucuda da olduğundan emin olun

"Yetki yok" hatası:
- Hesabınıza Administrator yetkisi verin
- Sunucuda yeterli yetkiniz olduğundan emin olun

## Destek

Discord: discord.gg/codevra

Web: codevra.com

---

Codevra 2026 - Tüm hakları saklıdır


