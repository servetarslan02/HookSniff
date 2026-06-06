import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Brain, Shield, Zap, TrendingUp, Activity, AlertTriangle, CheckCircle2, Settings, BarChart3, Eye, RefreshCw, GitBranch } from '@/components/icons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cortex AI — HookSniff',
  description: 'ML-powered anomaly detection, self-healing, predictive monitoring, and smart routing. The brain behind HookSniff.',
};

const mlAlgorithms = [
  {
    name: 'Adaptive Thresholds',
    desc: 'EWMA + IQR tabanlı eşik öğrenimi. Her endpoint kendi "normal"ini öğrenir — sabit eşik yok.',
    detail: 'Exponentially Weighted Moving Average (EWMA) ile pürüzlü trend takibi, Interquartile Range (IQR) ile outlier dayanıklılığı. Her endpoint için ayrı model.',
    icon: <Activity size={20} strokeWidth={1.75} />,
  },
  {
    name: 'Statistical Anomaly Detection',
    desc: 'Modified Z-Score + Mahalanobis mesafesi ile çok boyutlu anomali tespiti.',
    detail: 'Tek boyutlu Z-Score yerine, success rate, latency ve delivery rate\'i birlikte analiz eden çok boyutlu yaklaşım.',
    icon: <AlertTriangle size={20} strokeWidth={1.75} />,
  },
  {
    name: 'Multi-Armed Bandit (UCB1)',
    desc: 'Retry stratejileri, circuit breaker eşikleri ve throttle oranları için en iyi aksiyonu otomatik seçer.',
    detail: 'UCB1 formülü: exploitation + exploration bonus. Her endpoint için ayrı öğrenme — keşif dengesi otomatik.',
    icon: <Settings size={20} strokeWidth={1.75} />,
  },
  {
    name: 'Time Series Forecasting',
    desc: 'Holt-Winters + çoklu mevsimsellik (saatlik + günlük) ile gelecek tahmini.',
    detail: 'Prophet-benzeri yaklaşım: trend bileşeni, 24 saatlik mevsimsellik, 7 günlük mevsimsellik ve CUSUM changepoint detection.',
    icon: <TrendingUp size={20} strokeWidth={1.75} />,
  },
  {
    name: 'Concept Drift Detection',
    desc: 'Page-Hinkley + ADWIN + Kolmogorov-Smirnov ile model bozulmasını otomatik tespit eder.',
    detail: 'Üç algoritma birlikte çalışır: ani değişimler (Page-Hinkley), kademeli değişimler (ADWIN), dağılım değişimi (KS Test). Drift tespit edilince otomatik yeniden eğitim tetiklenir.',
    icon: <GitBranch size={20} strokeWidth={1.75} />,
  },
  {
    name: 'Contextual Bandit (Thompson Sampling)',
    desc: 'Bağlama göre en iyi healing aksiyonunu seçen gelişmiş bandit algoritması.',
    detail: 'Sadece geçmiş performansa değil, anlık bağlama (saat, trafik seviyesi, hata türü) göre karar verir.',
    icon: <Brain size={20} strokeWidth={1.75} />,
  },
];

const pipelineStages = [
  { stage: '1', name: 'Signal Collector', interval: '1 saat', desc: 'Teslimat verilerini saatlik özetlere dönüştürür. PostgreSQL PERCENTILE_CONT ile doğru p95/p99 hesaplar.' },
  { stage: '2', name: 'Profile Engine', interval: '15 dk', desc: 'Her endpoint için davranış profili oluşturur: 1h/24h/7d pencereler, en yoğun/sessiz saat, hata dağılımı.' },
  { stage: '3', name: 'Anomaly Scorer', interval: '5 dk', desc: 'ML modelleriyle anomali skoru hesaplar. Model eğitilmemişse formül tabanlı fallback kullanır.' },
  { stage: '3b', name: 'Alert Correlation', interval: '5 dk', desc: 'İlgili anomalileri tek bir kök neden alarmına gruplar. 100 alarm → 1 kök neden.' },
  { stage: '4', name: 'Self-Healing', interval: '5 dk', desc: 'Otomatik düzeltici aksiyonlar: rate limit azaltma, circuit breaker sıkılaştırma, timeout artırma, fallback URL\'ye geçiş.' },
  { stage: '5', name: 'Action Memory', interval: 'Sürekli', desc: 'Her aksiyonu ve sonucunu kaydeder. Multi-Armed Bandit için strateji ağırlıklarını günceller.' },
  { stage: '6', name: 'Recovery Surge', interval: 'İhtiyaç', desc: 'Outage sonrası kuyruktaki webhook\'ları kontrollü hızda yeniden gönderir. "Recovery surge" paternini önler.' },
  { stage: '7', name: 'Predictive Engine', interval: '15 dk', desc: 'Trend analiziyle arıza olasılığını ve kapasite tahminini hesaplar.' },
  { stage: '8', name: 'Insights Engine', interval: '24 saat', desc: 'Aksiyona geçirilebilir içgörüler üretir: düşüş trendleri, yüksek latency, baskın hata türleri.' },
  { stage: '9', name: 'Smart Routing', interval: '15 dk', desc: 'Fallback URL\'ler arasında en iyi performansa sahip olanı otomatik seçer.' },
  { stage: '10', name: 'ML Training', interval: '15 dk', desc: 'Tüm ML modellerini toplu olarak eğitir. Model versiyonlama ile geri alma desteği.' },
  { stage: '11', name: 'Drift Detection', interval: '10 dk', desc: 'Model bozulmasını tespit eder. Kritik drift\'te otomatik yeniden eğitim tetikler.' },
  { stage: '12', name: 'Proactive Healing', interval: '15 dk', desc: 'Anomali oluşmadan önce bozulma trendlerini tespit edip önleyici aksiyon alır.' },
];

const healingActions = [
  { action: 'rate_limit_reduce', desc: 'Endpoint rate limit\'ini %25 azaltır', severity: 'medium' },
  { action: 'circuit_tighten', desc: 'Circuit breaker eşiklerini sıkılaştırır', severity: 'medium' },
  { action: 'retry_slowdown', desc: 'Retry hızını yavaşlatır', severity: 'low' },
  { action: 'timeout_adjust', desc: 'Timeout süresini %50 artırır (maks 30s)', severity: 'low' },
  { action: 'retry_increase', desc: 'Maks retry sayısını artırır', severity: 'low' },
  { action: 'fallback_url_switch', desc: 'Fallback URL\'ye otomatik geçiş yapar', severity: 'high' },
  { action: 'auto_disable', desc: 'Endpoint\'i otomatik devre dışı bırakır', severity: 'critical' },
];

async function CortexContent(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('docs');

  return (
    <article className="prose prose-gray max-w-none">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 dark:border-purple-800 mb-4">
          <Brain size={16} className="text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Cortex AI Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          Cortex: Yapay Zeka Destekli Webhook Altyapısı
        </h1>
        <p className="text-lg text-gray-600 dark:text-slate-400 mb-4">
          HookSniff&apos;ın beyni. Gerçek ML algoritmaları ile çalışan, kendi kendini iyileştiren, tahmin yapan ve optimize eden akıllı sistem.
        </p>
        <div className="flex flex-wrap gap-2 not-prose">
          {['Anomali Tespiti', 'Self-Healing', 'Tahmin', 'Drift Detection', 'Smart Routing', 'AutoML'].map((tag) => (
            <span key={tag} className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* What is Cortex */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cortex Nedir?</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Cortex, HookSniff&apos;ın her endpoint için ayrı öğrenen, kendi kendini iyileştiren ve gelecekteki sorunları önceden tahmin eden yapay zeka motorudur.
          Sabit kurallar yerine <strong>gerçek ML algoritmaları</strong> kullanır — her endpoint kendi &quot;normal&quot;ini öğrenir.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose mb-6">
          {[
            { icon: <Eye size={20} />, title: 'Görme', desc: 'Anlık anomali tespiti ve çok boyutlu analiz', color: 'blue' },
            { icon: <Zap size={20} />, title: 'Öğrenme', desc: 'Her endpoint için ayrı ML modeli eğitimi', color: 'amber' },
            { icon: <Shield size={20} />, title: 'Koruma', desc: 'Proaktif healing ve tahmine dayanıklı aksiyonlar', color: 'green' },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} className={`p-5 rounded-xl border border-${color}-200 dark:border-${color}-800/30 bg-${color}-50 dark:bg-${color}-900/10`}>
              <div className={`text-${color}-600 dark:text-${color}-400 mb-3`}>{icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
          <p className="text-sm text-purple-800 dark:text-purple-300">
            <strong><Brain size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Kural tabanlı değil, öğrenen sistem.</strong> Cortex sabit eşikler kullanmaz.
            Her endpoint kendi geçmiş verisinden &quot;normal&quot;i öğrenir ve ona göre anomali tespit eder.
            Yeni bir endpoint bile 10 veri noktasından sonra ML tabanlı analize geçer.
          </p>
        </div>
      </section>

      {/* How It Works — Pipeline */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nasıl Çalışır?</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          Cortex 15 aşamalı bir pipeline olarak çalışır. Her aşamanın bağımsız zamanlaması, timeout koruması ve dağıtık kilidi vardır.
          Bir aşamanın hatası diğerlerini etkilemez.
        </p>

        <div className="not-prose space-y-3">
          {pipelineStages.map((s) => (
            <div key={s.stage} className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {s.stage}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{s.name}</h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 rounded">
                    {s.interval}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ML Algorithms */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">ML Algoritmaları</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          Cortex sadece kural tabanlı değil — gerçek makine öğrenimi algoritmaları kullanır. Her endpoint için ayrı model eğitilir ve PostgreSQL&apos;de saklanır.
        </p>

        <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4">
          {mlAlgorithms.map((algo) => (
            <div key={algo.name} className="p-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  {algo.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{algo.name}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{algo.desc}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">{algo.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Anomaly Detection Deep Dive */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Anomali Tespiti Nasıl Çalışır?</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Her endpoint için iki aşamalı anomali tespiti yapılır:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-6">
          <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-900/10">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</span>
              ML Yolu (≥10 veri noktası)
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Adaptive Threshold (EWMA + IQR) ile eşik belirleme</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Statistical Detection (Z-Score + Mahalanobis) ile anomali skoru</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> İki skorun ağırlıklı ortalaması (50/50)</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> ML güven skoru dahil edilir</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/10">
            <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">2</span>
              Fallback Yolu (&lt;10 veri noktası)
            </h3>
            <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-2">
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Latency spike (ağırlık: 30%)</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Success rate drop (ağırlık: 30%)</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Error burst (ağırlık: 20%)</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Traffic anomaly (ağırlık: 10%)</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Consecutive failures (ağırlık: 10%)</li>
            </ul>
          </div>
        </div>

        <div className="not-prose p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Anomali Kategorileri</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Low (0-39)', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
              { label: 'Medium (40-69)', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
              { label: 'High (70-79)', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
              { label: 'Critical (80-100)', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
            ].map(({ label, color }) => (
              <span key={label} className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${color}`}>{label}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Self-Healing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Otomatik Kendini İyileştirme</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Cortex yüksek anomali skorları tespit ettiğinde otomatik düzeltici aksiyonlar alır.
          <strong> Circuit breaker</strong> mekanizması sayesinde tek bir yüksek skor yıkıcı aksiyon tetiklemez —
          art arda yüksek skorlar gerekir.
        </p>

        <div className="not-prose mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Aksiyon</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Açıklama</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Önem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {healingActions.map((a) => (
                  <tr key={a.action}>
                    <td className="px-4 py-3 font-mono text-xs text-purple-600 dark:text-purple-400">{a.action}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{a.desc}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                        a.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        a.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                        a.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong><AlertTriangle size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Circuit Breaker Koruması:</strong> Auto-disable aksiyonu sadece son 3 saat içinde
            art arda 3+ yüksek anomali skoru varsa tetiklenir. Tek bir anlık sorun yıkıcı aksiyona yol açmaz.
          </p>
        </div>
      </section>

      {/* Proactive Healing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Proaktif İyileştirme</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Reaktif healing (sorun olduktan sonra) yerine, Cortex <strong>sorun olmadan önce</strong> harekete geçer.
          Bozulma trendlerini erken tespit edip önleyici aksiyonlar alır.
        </p>
        <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Bozulma Trendi Tespiti', desc: 'Son 6 saatte success rate düşüş trendinde mi? Eşik altına düşmeden önce uyarı verir.', icon: <TrendingUp size={18} /> },
            { title: 'Peak Hazırlığı', desc: 'Rate limit\'e yaklaşıyorsanız önceden uyarır. Günlük limitin %80+\'ını kullanıyorsanız bilgilendirir.', icon: <BarChart3 size={18} /> },
            { title: 'Önleyici Throttle', desc: 'Latency artıyor ama henüz anomali seviyesinde değilse, throttle oranını proaktif olarak ayarlar.', icon: <Zap size={18} /> },
          ].map(({ title, desc, icon }) => (
            <div key={title} className="p-4 rounded-xl border border-green-200 dark:border-green-800/30 bg-green-50 dark:bg-green-900/10">
              <div className="text-green-600 dark:text-green-400 mb-2">{icon}</div>
              <h3 className="font-bold text-green-900 dark:text-green-300 text-sm mb-1">{title}</h3>
              <p className="text-xs text-green-700 dark:text-green-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Predictive Engine */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tahmin Motoru</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Geçmiş trendleri analiz ederek gelecekteki sorunları önceden tahmin eder.
        </p>
        <div className="not-prose space-y-4">
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Arıza Olasılığı Tahmini</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
              Son 6 saatlik veriyi lineer regresyon ile analiz eder. Trend eğimi, momentum ve R² değerini hesaplar.
              Negatif trend + düşük momentum = yüksek arıza olasılığı.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> &gt;70% → Kritik uyarı</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> 30-70% → İzleme</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> &lt;30% → Normal</span>
            </div>
          </div>
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Kapasite Tahmini</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Ortalama ve peak teslimat oranlarına göre rate limit&apos;e ne zaman ulaşılacağını tahmin eder.
              Kullanım yüzdesi ve tahmini gün bilgisini dashboard&apos;da görebilirsiniz.
            </p>
          </div>
        </div>
      </section>

      {/* Drift Detection */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Concept Drift Tespiti</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          ML modelleri zamanla &quot;eskiyebilir&quot; — endpoint davranışı değişirse model artık doğru tahmin yapamaz.
          Cortex bunu otomatik tespit eder ve yeniden eğitim tetikler.
        </p>
        <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Page-Hinkley', type: 'Ani Değişim', desc: 'Kümülatif sapma takibi. Dağılım aniden değişirse tespit eder.', color: 'red' },
            { name: 'ADWIN', type: 'Kademeli Değişim', desc: 'Adaptive pencere boyutu. Yavaş yavaş değişen paternleri yakalar.', color: 'amber' },
            { name: 'KS Testi', type: 'Dağılım Değişimi', desc: 'İki örneğin aynı dağılımdan gelip gelmediğini kontrol eder.', color: 'blue' },
          ].map(({ name, type, desc, color }) => (
            <div key={name} className={`p-4 rounded-xl border border-${color}-200 dark:border-${color}-800/30`}>
              <h3 className={`font-bold text-${color}-900 dark:text-${color}-300 text-sm mb-1`}>{name}</h3>
              <span className="text-xs text-gray-500 dark:text-slate-500 mb-2 block">{type}</span>
              <p className="text-xs text-gray-600 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
        <div className="not-prose mt-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            <strong>Drift tespit edildiğinde ne olur?</strong> Severity &gt; 0.7 ise otomatik yeniden eğitim tetiklenir.
            Düşük severity&apos;de sadece izleme artırılır. Tüm drift olayları <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded text-xs">ml_drift_events</code> tablosuna kaydedilir.
          </p>
        </div>
      </section>

      {/* Smart Routing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Akıllı Yönlendirme</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Endpoint&apos;inizin birden fazla fallback URL&apos;si varsa, Cortex en iyi performansa sahip olanı otomatik seçer.
        </p>
        <div className="not-prose p-5 rounded-xl border border-gray-200 dark:border-slate-700">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Nasıl karar verir?</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
            <p>1. Mevcut endpoint&apos;in success rate&apos;i &lt;95% veya p95 latency &gt;5000ms ise fallback aranır</p>
            <p>2. Her fallback URL için son 1 saatteki teslimat verileri analiz edilir</p>
            <p>3. Skorlama: <strong>Success Rate (70%) + Latency (30%)</strong></p>
            <p>4. En yüksek skorlu URL&apos;ye otomatik geçiş yapılır</p>
          </div>
        </div>
      </section>

      {/* AutoML */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AutoML</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Cortex sadece modelleri eğitmekle kalmaz, <strong>model parametrelerini de otomatik optimize eder</strong>.
          Bayesian Optimization yaklaşımıyla her ML modeli için en iyi hiperparametreleri bulur.
        </p>
        <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Optimize Edilen Parametreler</h3>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
              <li>• <strong>Adaptive Threshold:</strong> alpha, threshold_multiplier, iqr_multiplier</li>
              <li>• <strong>Time Series:</strong> alpha, beta, gamma (Holt-Winters smoothing factors)</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Otomatik Deploy</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              5+ deneme yapıldıktan sonra, en iyi parametre seti mevcut baseline&apos;dan %5+ daha iyi performans gösteriyorsa
              otomatik olarak uygulanır.
            </p>
          </div>
        </div>
      </section>

      {/* Chaos Engineering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Chaos Engineering</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Cortex&apos;in dayanıklılığını test etmek için kontrollü arızalar simüle edilir.
        </p>
        <div className="not-prose grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { name: 'Redis Down', severity: 'low' },
            { name: 'DB Slow', severity: 'medium' },
            { name: 'Endpoint Down', severity: 'high' },
            { name: 'Traffic Spike', severity: 'medium' },
            { name: 'Error Burst', severity: 'high' },
          ].map(({ name, severity }) => (
            <div key={name} className="p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-center">
              <p className="font-semibold text-xs text-gray-900 dark:text-white mb-1">{name}</p>
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                severity === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              }`}>{severity}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Model Quality & A/B Testing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Model Kalite Takibi & A/B Testi</h2>
        <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
              <BarChart3 size={16} /> Kalite Takibi
            </h3>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2">
              <li>• Her tahmin gerçek değerle karşılaştırılır</li>
              <li>• %20 tolerans içinde &quot;kabul edilebilir&quot; sayılır</li>
              <li>• Düşük kaliteli modeller otomatik sıfırlanır ve yeniden eğitilir</li>
              <li>• Kalite skoru: %60 accuracy + %25 düşük hata + %15 stabilite</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
              <GitBranch size={16} /> A/B Testi
            </h3>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2">
              <li>• İki modeli aynı endpoint üzerinde karşılaştırır</li>
              <li>• Trafik split oranı ayarlanabilir</li>
              <li>• İstatistiksel anlamlılık testi (z-test, p&lt;0.05)</li>
              <li>• Kazanan otomatik belirlenir ve uygulanır</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Explainable AI */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Açıklanabilir AI (XAI)</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Cortex her kararının arkasındaki nedenleri insan tarafından okunabilir şekilde açıklar.
          &quot;Bu endpoint neden yüksek risk altında?&quot; sorusuna net cevap verir.
        </p>
        <div className="not-prose p-5 rounded-xl border border-gray-200 dark:bg-slate-900/50 dark:border-slate-700">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Örnek Anomali Açıklaması</h3>
          <div className="p-4 bg-gray-900 rounded-lg text-sm font-mono text-green-400 leading-relaxed">
            <p>Son 24 veri noktasına göre:</p>
            <p>• Success Rate: 87.3% (baseline: 96.1%, 8.8% düştü)</p>
            <p>• Latency: 2340ms (baseline: 890ms, 1450ms arttı)</p>
            <p>• P95/Latency oranı: 3.2x ⚠️ yüksek</p>
            <p>• Skor: 72/100</p>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-slate-500">
            Her feature&apos;ın katkısı, yönü (risk artırır/azaltır) ve önem yüzdesi dahil edilir.
          </div>
        </div>
      </section>

      {/* Recovery Surge */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recovery Surge Kontrolü</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Bir outage sonrası kuyruktaki binlerce webhook aniden serbest bırakılırsa, tüketici sistem çökebilir.
          Cortex bunu önler.
        </p>
        <div className="not-prose p-5 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-4">
            {[10, 20, 50, 100, 200].map((rate, i) => (
              <div key={rate} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  i < 3 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  i < 4 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}>{rate}</div>
                {i < 4 && <span className="text-gray-300 dark:text-slate-600">→</span>}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Kademeli ramp-up: 10/dk → 20/dk → 50/dk → 100/dk → 200/dk.
            Her adım arasında 60 saniye bekleme. Başarı oranı %95&apos;in altına düşerse ramp durdurulur.
          </p>
        </div>
      </section>

      {/* Prometheus Metrics */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Prometheus Metrikleri</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Cortex metrikleri <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">/metrics</code> endpoint&apos;inde Prometheus formatında sunulur.
        </p>
        <div className="not-prose p-4 bg-gray-900 rounded-xl text-sm font-mono text-green-400 overflow-x-auto leading-relaxed">
          <p>cortex_hourly_stats_runs_total</p>
          <p>cortex_hourly_stats_endpoints_processed</p>
          <p>cortex_profile_updates_total</p>
          <p>cortex_anomaly_scores_high_total</p>
          <p>cortex_alerts_correlated_total</p>
          <p>cortex_healing_actions_total</p>
          <p>cortex_cascade_detections_total</p>
          <p>cortex_action_memory_records_total</p>
          <p>cortex_recovery_surges_started_total</p>
          <p>cortex_recovery_surges_completed_total</p>
          <p>cortex_predictions_generated_total</p>
          <p>cortex_insights_generated_total</p>
          <p>cortex_routing_decisions_total</p>
          <p>cortex_drift_detected_total</p>
        </div>
      </section>

      {/* Architecture */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Teknik Mimari</h2>
        <div className="not-prose p-5 rounded-xl border border-gray-200 dark:border-slate-700">
          <pre className="text-sm font-mono text-gray-600 dark:text-slate-400 overflow-x-auto leading-relaxed">
{`┌─────────────────────────────────────────────────────┐
│                 Cortex Scheduler                     │
│         (Tick every 30s, 15 stages)                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Signal   │→│ Profile  │→│ Anomaly  │          │
│  │ Collector│  │ Engine   │  │ Scorer   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│       │                          │                   │
│       ▼                          ▼                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Alert    │→│ Self     │→│ Proactive│          │
│  │Correlate │  │ Healing  │  │ Healing  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│       │                          │                   │
│       ▼                          ▼                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │Predictive│→│  Smart   │→│   ML     │          │
│  │ Engine   │  │ Routing  │  │ Training │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│       │                          │                   │
│       ▼                          ▼                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Drift    │→│  AutoML  │→│ Insights │          │
│  │Detection │  │          │  │ Engine   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                      │
├─────────────────────────────────────────────────────┤
│  PostgreSQL Advisory Locks (multi-instance safe)     │
│  Per-stage timeout protection                        │
│  Structured tracing (cortex_traces)                  │
│  Prometheus metrics (/metrics)                       │
└─────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sıkça Sorulan Sorular</h2>
        <div className="not-prose space-y-4">
          {[
            { q: 'Cortex ek maliyet getiriyor mu?', a: 'Hayır. Cortex tüm planlarda dahildir. ML modelleri kendi sunucularınızda çalışır, harici API çağırmaz.' },
            { q: 'Yeni endpoint\'ler için Cortex hemen çalışıyor mu?', a: 'Evet, ama ilk 10 veri noktasında formül tabanlı fallback kullanır. 10+ veri noktası sonrası ML otomatik devreye girer.' },
            { q: 'Auto-disable edilen endpoint ne zaman geri açılır?', a: 'Cortex her 15 dakikada bir devre dışı endpoint\'leri test eder. Son 2 saatte başarı oranı %95+ ise otomatik olarak geri açılır ve müşteriye bildirim gönderilir.' },
            { q: 'ML modelleri nerede saklanıyor?', a: 'PostgreSQL\'de ml_models tablosunda. Her endpoint için ayrı model parametreleri JSON olarak saklanır.' },
            { q: 'Cortex\'i kapatabilir miyim?', a: 'Evet, platform_settings.cortex_config ile tüm aşamaları veya belirli aşamaları devre dışı bırakabilirsiniz.' },
          ].map(({ q, a }) => (
            <div key={q} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">{q}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sonraki Adımlar</h2>
        <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { href: '/docs/analytics', title: 'Analytics', desc: 'Cortex metriklerini dashboard\'da görüntüleyin.' },
            { href: '/docs/alerts', title: 'Alerts', desc: 'Cortex alert\'lerini yapılandırın.' },
            { href: '/docs/architecture', title: 'Architecture', desc: 'Sistem mimarisini detaylı inceleyin.' },
            { href: '/docs/monitor-performance', title: 'Monitor Performance', desc: 'Endpoint performansını izleyin.' },
          ].map(({ href, title, desc }) => (
            <a key={href} href={href} className="block p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{desc}</p>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}

export default async function CortexPage(params: Promise<{ locale: string }>) {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-700" /><div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" /><div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" /><div className="h-64 w-full rounded bg-gray-200 dark:bg-gray-700" /></div>}>
      <CortexContent {...params} />
    </Suspense>
  );
}
