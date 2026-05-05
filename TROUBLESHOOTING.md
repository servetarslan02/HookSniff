# 🛠️ HookRelay — Sorun Çözücü

> Sorun mu var? Buraya bak. Çözüm yoksa bana sor.

---

## 🚀 İlk Kurulum

### 1. Docker Desktop Kur
- https://www.docker.com/products/docker-desktop
- Windows/Mac/Linux
- Kurulumdan sonra bilgisayarını yeniden başlat

### 2. Projeyi Çalıştır
```bash
cd hookrelay
make local
```

### 3. Kontrol Et
- Dashboard: http://localhost:3001
- API: http://localhost:3000/health

---

## ❌ Yaygın Sorunlar

### "Docker bulunamadı" / "docker: command not found"
**Çözüm:** Docker Desktop kur. https://www.docker.com/products/docker-desktop

### "Port 5432 already in use"
**Çözüm:** Başka bir PostgreSQL çalışıyor. Durdur:
```bash
# Windows
net stop postgresql

# Mac
brew services stop postgresql

# Linux
sudo systemctl stop postgresql
```

### "Port 3000 already in use"
**Çözüm:** Başka bir uygulama kullanıyor. Durdur:
```bash
# Portu bul
lsof -i :3000

# İşlemi durdur (PID'yi yukarıdan al)
kill -9 <PID>
```

### "Build failed" / "Cargo error"
**Çözüm:** Cache temizle, tekrar dene:
```bash
make reset
```

### "Database connection refused"
**Çözüm:** PostgreSQL henüz hazır değil. 10 saniye bekle, tekrar dene. Hâlâ olmuyorsa:
```bash
make reset
```

### Dashboard açılıyor ama "API Error" gösteriyor
**Çözüm:** API henüz başlamadı. 30 saniye bekle. Hâlâ olmuyorsa:
```bash
make logs-api  # API log'larını kontrol et
```

### "Out of memory" / "Container killed"
**Çözüm:** Docker'a daha fazla RAM ver:
- Docker Desktop → Settings → Resources → Memory → 4GB

### Sayfa beyaz / yüklenmiyor
**Çözüm:**
1. F5 bas (yenile)
2. Ctrl+Shift+R (cache temizle)
3. F12 → Console → hata varsa bana gönder

---

## 🔧 Komutlar

```bash
make local      # Her şeyi başlat
make stop       # Durdur
make restart    # Yeniden başlat
make reset      # Sıfırla (veritabanı dahil)
make fix        # Sorunları otomatik çöz
make status     # Ne durumda göster
make logs       # Log'ları göster
make logs-api   # API log'ları
make clean      # Her şeyi temizle
```

---

## 📞 Hâlâ Çözemedin mi?

Bana şunu gönder:
1. Ne yaptın? (hangi komutu çalıştırdın)
2. Ne gördün? (hata mesajı)
3. Screenshot (ekran görüntüsü)

Ben hallederim.

---

## 💡 İpuçları

- **İlk açılış uzun sürer:** Docker image'ları indirilir, 5-10 dakika normal
- **İkinci açılış hızlı olur:** Image'lar cache'de kalır
- **Veritabanı sıfırlamak:** `make reset` → her şey silinir, sıfırdan başlar
- **Log'lara bak:** Sorun varsa `make logs` ile ne olduğunu gör
