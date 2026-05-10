# 🐛 08 — Login / Register Sayfası Hataları

> Durum: 🟡 ORTA — Çeviri eksiklikleri, UX sorunları
> Etkilenen sayfa: Login + Register (tüm dashboard sayfalarını etkiliyor)
> Tahmini düzeltme süresi: 30 dk

---

## 1. Hata Mesajları Form Değişince Kaybolmuyor (KRİTİK)

**Sorun:** Login formunda oluşan hata mesajı register formunda, register hata mesajı login formunda görünüyor.
**Etki:** Kullanıcı farklı forma geçince eski hata mesajını görüyor, kafa karıştırıcı.

**Çözüm:** Form değiştirince hata state'ini temizle.

---

## 2. "Şifremi Unuttum" Linki Yok

**Sorun:** Login formunda "Forgot Password?" linki yok.
**Etki:** Şifresini unutan kullanıcı sıfırlayamıyor.

**Not:** Backend'de `/v1/auth/password-reset` endpoint'i zaten var (migration 030). Frontend'de link eksik.

---

## 3. Yükleniyor Göstergesi Yok

**Sorun:** Login/register butonuna basılınca API çağrısı sırasında loading spinner/göstergesi yok.
**Etki:** Kullanıcı butona bastı ama bir şey olmadığını düşünüyor, tekrar basıyor.

**Çözüm:** Submit butonunda loading state göster.

---

## 4. Çeviri Eksiklikleri

| Metin | Durum | Olması Gereken |
|-------|-------|----------------|
| "Or continue with" | ❌ İngilizce | "Veya şununla devam et" |
| "Unauthorized" | ❌ İngilizce | "Yetkisiz erişim" |
| "Email already registered" | ❌ İngilizce | "Bu email zaten kayıtlı" |
| "Strong" (password indicator) | ❌ İngilizce | "Güçlü" |
| "Tekrar hoş geldin" | ✅ Türkçe | Doğru |

---

## 5. Empty Alert Element

**Sorun:** DOM'da boş bir `<alert>` elementi her zaman var.
**Etki:** Ekran okuyucular tarafından okunabilir, gereksiz bildirim.

---

## 6. Client-Side Auth Redirect Timing

**Sorun:** Dashboard sayfası kısa bir süre login formunu gösteriyor, sonra login'e yönlendiriyor.
**Etki:** Kullanıcı kısa bir flash görüyor.

**Çözüm:** Server-side redirect veya loading state kullan.

---

## 7. Brand Button Context

**Sorun:** "Or continue with" ifadesi Türkçe locale'de İngilizce.
**Etki:** Google/GitHub login butonları tutarsız görünüyor.

---

## 8. Dashboard'a Erişilemedi

**Sorun:** Tüm 32 dashboard sayfası login'e yönlendiriyor. Geçerli kimlik bilgileri olmadığı için dashboard içeriği test edilemedi.
**Not:** İkinci bir geçiş gerekli.

---

## Önerilen Düzeltme Adımları

1. **Hata state temizliği** — Form değiştirince error state sıfırla
2. **Forgot password linki** — Login formuna ekle (backend endpoint zaten var)
3. **Loading state** — Submit butonuna spinner ekle
4. **Çeviri** — 4 hardcoded metni Türkçeleştir
5. **Empty alert** — Boş alert elementini kaldır
6. **Dashboard test** — Geçerli kimlik bilgileri ile ikinci geçiş