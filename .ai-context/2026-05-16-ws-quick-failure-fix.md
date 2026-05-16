# 2026-05-16 — WebSocket Quick Failure Fix

## Sorun
WebSocket indicator hep sarı (connecting) kalıyordu.
Cloud Run'da WS bağlantısı kurulamıyor, 10 kez yeniden deniyordu (~17 dakika).

## Çözüm

### 1. useWebSocket.ts — Quick failure detection
Bağlantı 3 saniyeden kısa sürede kapanırsa, hızlı başarısızlık olarak algılanır
ve fallback'e daha erken geçilir (3 deneme yerine ~2-3 deneme).

### 2. useRealtime.ts — Connecting durumunda polling
WS "connecting" durumundayken de 30 saniyelik polling başlatılır.
Böylece veri taze kalır, WS bağlantısı kurulana kadar kullanıcı eski veri görmez.

## Neden hep sarı kalıyordu?
- Cloud Run WebSocket desteği sınırlı
- Bağlantı hemen kapanıyor ama `onclose` "quick failure" algılamıyordu
- 10 deneme × exponential backoff = ~17 dakika sarı
- Şimdi: 2-3 deneme sonra polling'e geçer
