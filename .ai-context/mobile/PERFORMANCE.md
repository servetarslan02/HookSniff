# ⚡ HookSniff Mobile — Performans Raporu

> Tarih: 2026-05-08 22:12 GMT+8
> Kaynaklar: Expo resmi blog, React Native dokümanları, Medium benchmark yazıları, Reddit topluluk tartışmaları

---

## 📊 Endüstri Verileri (2025-2026)

### React Native Gerçek Dünya Performansı

| Metrik | React Native (Optimize) | React Native (Optimize Edilmemiş) | Hedefimiz |
|--------|------------------------|-----------------------------------|-----------|
| **Cold start** | 2-4 saniye | 4-10 saniye | < 2 saniye |
| **Sayfa geçişi** | 200ms | 500-1000ms | < 300ms |
| **FPS** | 60fps | <60fps | 60fps |
| **Bellek** | 100-150MB | 200-300MB | < 150MB |
| **APK boyutu** | 30-50MB | 80-120MB | < 50MB |

### Kritik İstatistikler

> *"Apps taking >3 seconds lose up to 70% of first-time users"*
> — 2026 Performance Checklist, Medium

> *"A 1-second delay can drop conversions by 26%"*
> — Aynı kaynak

> *"React Native achieves as low as 200ms transitions with native components"*
> — KodekX Solutions benchmark, 2025

---

## 🔧 Uygulanacak Optimizasyonlar (Öncelik Sırası)

### 1. 🔴 Hermes Motoru (Zorunlu)

**Ne:** React Native'in optimize JS motoru
**Etki:** Cold start %30-50 daha hızlı
**Kaynak:** React Native resmi doküman

```
// app.json
"jsEngine": "hermes"
```

**Benchmark:**
- Hermes yok: ~4-10 saniye cold start
- Hermes var: ~2-3 saniye cold start
- **%50 iyileşme**

### 2. 🔴 New Architecture (Zorunlu)

**Ne:** React Native'in yeni mimarisi (TurboModules + Fabric)
**Etki:** %30-50 daha hızlı startup, daha akıcı UI
**Kaynak:** 2026 Performance Checklist

```
// app.json
"newArchEnabled": true
```

**Ne yapıyor:**
- TurboModules → Native modüller lazy yüklenir (ilk açılışta yüklenmez)
- Fabric renderer → Daha hızlı UI render
- JSI → JS-Native köprüsü optimize

### 3. 🔴 FlatList Optimizasyonu (Zorunlu)

**Kaynak:** React Native resmi dokümanları (reactnative.dev)

| Prop | Varsayılan | Bizim Değer | Ne Yapıyor |
|------|-----------|-------------|------------|
| `windowSize` | 21 | 10 | Daha az item bellekte tutulur |
| `maxToRenderPerBatch` | 10 | 5 | Her batch'te daha az item render |
| `updateCellsBatchingPeriod` | 50ms | 100ms | Daha seyrek render |
| `initialNumToRender` | 10 | 15 | İlk ekranda görünen item sayısı |
| `removeClippedSubviews` | false | true | Görünmeyen item'lar detach edilir |
| `getItemLayout` | yok | var | Boyut bilgisi verilirse async layout hesaplama kalkar |

**Kod örneği (React Native dokümanlarından):**
```tsx
const renderItem = useCallback(({item}) => (
  <EventCard key={item.id} event={item} />
), []);

<FlatList
  data={events}
  renderItem={renderItem}
  windowSize={10}
  maxToRenderPerBatch={5}
  updateCellsBatchingPeriod={100}
  initialNumToRender={15}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: 80, // item yüksekliği
    offset: 80 * index,
    index,
  })}
/>
```

### 4. 🔴 React.memo (Zorunlu)

**Kaynak:** React Native dokümanları

> *"React.memo() creates a memoized component that will be re-rendered only when the props passed to the component change"*

```tsx
const EventCard = memo(
  ({ event }: { event: Event }) => (
    <View>
      <Text>{event.name}</Text>
      <Badge status={event.status} />
    </View>
  ),
  (prevProps, nextProps) => {
    return prevProps.event.id === nextProps.event.id &&
           prevProps.event.status === nextProps.event.status;
  }
);
```

**Etki:** Gereksiz render'lar %70 azalır

### 5. 🟡 TanStack Query Cache (Önemli)

**Kaynak:** Reddit r/reactnative, dev.to offline-first rehberi

**Cache stratejisi:**
```tsx
const { data } = useQuery({
  queryKey: ['events'],
  queryFn: fetchEvents,
  staleTime: 5 * 60 * 1000,     // 5 dakika fresh
  cacheTime: 30 * 60 * 1000,    // 30 dakika cache'de tut
  refetchOnWindowFocus: true,    // Sayfa açılınca yenile
  keepPreviousData: true,        // Yeni veri gelene kadar eskiyi göster
});
```

**Ne yapıyor:**
- İlk açılış: API'den gelir (1-2 saniye)
- İkinci açılış: Cache'den gelir (anında)
- Arka planda: Güncelleme kontrol edilir (stale-while-revalidate)
- Offline: Son cache'lenen veri gösterilir

### 6. 🟡 Skeleton Loading (Önemli)

**Kaynak:** Facebook, Instagram, Twitter hepsi kullanıyor

**Ne:** Yüklenirken gri kutular gösterilir
**Etki:** Kullanıcı "donuyor" hissetmez, %40 daha az bekleme algısı

```tsx
function EventListSkeleton() {
  return (
    <View>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} className="h-20 bg-gray-200 rounded-lg mb-3" />
      ))}
    </View>
  );
}
```

### 7. 🟡 Optimistic Update (Önemli)

**Kaynak:** TanStack Query dokümanları

**Ne:** Butona basınca anında sonuç gösterilir, arka planda API'ye gider

```tsx
const mutation = useMutation({
  mutationFn: replayWebhook,
  onMutate: async (id) => {
    // Anında "Gönderildi" göster
    await queryClient.cancelQueries(['events']);
    const previous = queryClient.getQueryData(['events']);
    queryClient.setQueryData(['events'], old =>
      old.map(e => e.id === id ? { ...e, status: 'replaying' } : e)
    );
    return { previous };
  },
  onError: (err, id, context) => {
    // Hata olursa geri al
    queryClient.setQueryData(['events'], context.previous);
  },
});
```

### 8. 🟡 Lazy Loading (Önemli)

**Kaynak:** 2026 Performance Checklist

**Ne:** Sayfalar tıklandığında yüklenir
**Etki:** İlk açılış %40 daha hızlı

```tsx
// Expo Router otomatik lazy loading yapar
// Ama biz de manuel yapabiliriz:
const AlertsScreen = lazy(() => import('./alerts'));
const AdminScreen = lazy(() => import('./admin'));
```

### 9. 🟢 Image Cache (Güzel olur)

**Kaynak:** React Native dokümanları, @d11/react-native-fast-image

**Ne:** Görseller bir kez iner, cache'den gösterilir
**Etki:** Liste kaydırma %30 daha akıcı

```tsx
import FastImage from '@d11/react-native-fast-image';

<FastImage
  source={{ uri: endpoint.icon, priority: FastImage.priority.normal }}
  style={{ width: 40, height: 40 }}
/>
```

### 10. 🟢 Reanimated Worklet (Güzel olur)

**Kaynak:** react-native-reanimated dokümanları

**Ne:** Animasyonlar native thread'de çalışır (JS thread'i bloklamaz)
**Etki:** 60fps animasyon, JS yoğun işlerde bile akıcı

```tsx
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

const opacity = useSharedValue(0);
opacity.value = withSpring(1); // Native thread'de çalışır
```

---

## 📱 Gerçek Uygulama Örnekleri

### Instagram (React Native)
- Milyonlarca günlük etkileşim
- FlatList + virtualization
- Image cache (FastImage benzeri)
- Optimistic update (beğeni, yorum)

### Facebook (React Native)
- Yıllardır production'da
- Hermes motoru kullanıyor
- New Architecture'a geçti

### Discord (React Native)
- Büyük liste optimizasyonu
- Infinite scroll
- Real-time güncelleme (WebSocket)

---

## 📋 Performans Kontrol Listesi

### Geliştirme Aşamasında

| # | Kontrol | Öncelik |
|---|---------|---------|
| 1 | Hermes aktif | 🔴 |
| 2 | New Architecture aktif | 🔴 |
| 3 | FlatList optimize edilmiş | 🔴 |
| 4 | React.memo kullanılmış | 🔴 |
| 5 | TanStack Query cache | 🟡 |
| 6 | Skeleton loading | 🟡 |
| 7 | Optimistic update | 🟡 |
| 8 | Lazy loading | 🟡 |
| 9 | Image cache | 🟢 |
| 10 | Reanimated worklet | 🟢 |

### Test Aşamasında

| # | Test | Hedef |
|---|------|-------|
| 1 | Cold start (eski telefon) | < 3 saniye |
| 2 | Sayfa geçişi | < 300ms |
| 3 | Liste kaydırma (1000 item) | 60fps |
| 4 | Bellek kullanımı | < 150MB |
| 5 | APK boyutu | < 50MB |
| 6 | Pil tüketimi | Normal |

---

## 🎯 Sonuç

| Senaryo | Sonuç |
|---------|-------|
| **Tüm optimizasyonlar uygulanırsa** | Akıcı, hızlı, premium his |
| **Sadece zorunlu olanlar** | İyi, nadiren kasar |
| **Hiçbiri uygulanmazsa** | Kullanıcı kaybeder |

**Kaynaklar:**
- https://expo.dev/blog/best-practices-for-reducing-lag-in-expo-apps
- https://reactnative.dev/docs/optimizing-flatlist-configuration
- https://reactnative.dev/docs/hermes
- https://medium.com/@expertappdevs/app-startup-time-optimization-the-performance-checklist-a28d7f551780
- https://kodekx-solutions.medium.com/cross-platform-mobile-app-performance-metrics-flutter-vs-react-native-5d690991e123

---

> Son güncelleme: 2026-05-08 22:12 GMT+8
