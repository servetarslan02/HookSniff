const fs = require('fs');
const en = JSON.parse(fs.readFileSync('./src/messages/en.json', 'utf8'));
const tr = JSON.parse(fs.readFileSync('./src/messages/tr.json', 'utf8'));

// Common keys
en.cortex.common = {
  dataLoadError: 'An error occurred loading data',
  score: 'Score',
  severity: { critical: 'Critical', warning: 'Warning', info: 'Info', normal: 'Normal' }
};
tr.cortex.common = {
  dataLoadError: 'Veri yüklenirken hata oluştu',
  score: 'Skor',
  severity: { critical: 'Kritik', warning: 'Uyarı', info: 'Bilgi', normal: 'Normal' }
};

// AnomaliesTab
en.cortex.anomalies = {
  title: 'Detected Issues',
  description: 'Cortex checks your endpoints every 5 minutes. It shows sudden error spikes, slowdowns, or outages here.',
  empty: { title: 'No issues found', description: 'All endpoints are working normally' },
  severity: {
    critical: 'Critical issue — endpoint severely affected',
    major: 'Major issue — endpoint slowing down',
    minor: 'Minor issue — performance slightly degraded',
    normal: 'Normal — minor fluctuation'
  },
  detail: {
    srDropped: (v) => `Success rate dropped to ${v}%`,
    performanceDropped: 'Performance severely degraded',
    latencyIncreased: (v) => `Latency increased to ${v}ms`,
    errorRateHigh: 'Error rate higher than normal',
    shouldMonitor: 'Not severe but should be monitored',
    noConcern: 'Not concerning'
  },
  detectedBy: { ml: '🧠 Detected by ML', formula: '📊 Detected by formula' }
};
tr.cortex.anomalies = {
  title: 'Tespit Edilen Sorunlar',
  description: 'Cortex her 5 dakikada bir endpoint\'lerinizi kontrol eder. Ani hata artışı, yavaşlama veya kesinti tespit ederse burada gösterir.',
  empty: { title: 'Hiç sorun yok', description: 'Tüm endpoint\'ler normal çalışıyor' },
  severity: {
    critical: 'Kritik sorun — endpoint ciddi şekilde etkilenmiş',
    major: 'Büyük sorun — endpoint yavaşlıyor',
    minor: 'Küçük sorun — performans hafif düştü',
    normal: 'Normal — küçük dalgalanma'
  },
  detail: {
    srDropped: (v) => `Başarı oranı %${v}'ye düştü`,
    performanceDropped: 'Performans ciddi şekilde düştü',
    latencyIncreased: (v) => `Gecikme ${v}ms'ye çıktı`,
    errorRateHigh: 'Hata oranı normalden yüksek',
    shouldMonitor: 'Şiddetli değil ama izlenmeli',
    noConcern: 'Endişe verici değil'
  },
  detectedBy: { ml: '🧠 ML ile tespit edildi', formula: '📊 Formül ile tespit edildi' }
};

// HealingTab
en.cortex.healing = {
  title: 'Auto Corrections',
  description: 'Cortex automatically intervenes when it detects issues. All corrections are listed here.',
  empty: { title: 'No corrections made', description: 'All endpoints are healthy, no intervention needed' },
  reason: (v) => `Reason: ${v}`,
  status: { recovered: 'Resolved', pending: 'Ongoing' },
  action: {
    auto_disable: { recovered: 'Endpoint reopened', disabled: 'Endpoint temporarily closed' },
    circuit_tighten: 'Firewall tightened',
    retry_slowdown: 'Retry slowed down',
    rate_limit_reduce: 'Rate limit reduced',
    fallback_url_switch: 'Switched to backup URL',
    retry_increase: 'Retry count increased',
    timeout_adjust: 'Timeout increased',
    proactive_throttle: 'Proactive throttling applied',
    cascade_alert: 'Batch issue warning',
    unknown: 'Unknown action'
  },
  detail: {
    auto_disable: { recovered: 'Endpoint is healthy again, auto-reopened', disabled: 'Temporarily disabled due to too many errors' },
    circuit_tighten: 'Increased protection sensitivity due to high error rate',
    retry_slowdown: 'Server is struggling, increased interval between retries',
    rate_limit_reduce: 'Reduced request count to protect server',
    fallback_url_switch: 'Main URL has issues, redirected to backup',
    retry_increase: 'More retries will be attempted for failed deliveries',
    timeout_adjust: 'Server responding slowly, extended wait time',
    proactive_throttle: 'Latency increasing, precaution taken before issues occur',
    cascade_alert: 'Multiple endpoints affected simultaneously'
  }
};
tr.cortex.healing = {
  title: 'Otomatik Düzeltmeler',
  description: 'Cortex sorun tespit ettiğinde otomatik müdahale eder. Tüm düzeltmeler burada listelenir.',
  empty: { title: 'Düzeltme yapılmadı', description: 'Tüm endpoint\'ler sağlıklı, müdahale gerekmedi' },
  reason: (v) => `Sebep: ${v}`,
  status: { recovered: 'Çözüldü', pending: 'Devam ediyor' },
  action: {
    auto_disable: { recovered: 'Endpoint geri açıldı', disabled: 'Endpoint geçici olarak kapatıldı' },
    circuit_tighten: 'Güvenlik duvarı sıkılaştırıldı',
    retry_slowdown: 'Tekrar deneme yavaşlatıldı',
    rate_limit_reduce: 'Hız sınırı düşürüldü',
    fallback_url_switch: 'Yedek adrese geçildi',
    retry_increase: 'Tekrar deneme sayısı artırıldı',
    timeout_adjust: 'Zaman aşımı artırıldı',
    proactive_throttle: 'Önleyici yavaşlatma uygulandı',
    cascade_alert: 'Toplu sorun uyarısı',
    unknown: 'Bilinmeyen aksiyon'
  },
  detail: {
    auto_disable: { recovered: 'Endpoint tekrar sağlıklı, otomatik açıldı', disabled: 'Çok fazla hata olduğu için geçici olarak devre dışı bırakıldı' },
    circuit_tighten: 'Hata oranı yüksek olduğu için koruma hassasiyeti artırıldı',
    retry_slowdown: 'Sunucu zorlanıyor, denemeler arası süre artırıldı',
    rate_limit_reduce: 'Sunucuyu korumak için istek sayısı azaltıldı',
    fallback_url_switch: 'Ana adreste sorun var, yedek adrese yönlendirildi',
    retry_increase: 'Başarısız iletimler için daha fazla deneme yapılacak',
    timeout_adjust: 'Sunucu yavaş yanıt veriyor, bekleme süresi uzatıldı',
    proactive_throttle: 'Gecikme artıyor, sorun olmadan önlem alındı',
    cascade_alert: 'Birden fazla endpoint aynı anda etkilendi'
  }
};

// PredictionsTab
en.cortex.predictions = {
  title: 'Future Predictions',
  description: 'Cortex analyzes historical data to predict future potential issues.',
  empty: { title: 'No predictions yet', description: 'At least a few hours of data are needed to generate predictions.' },
  probability: (v) => `${v}% probability`,
  severity: {
    high: 'Highly likely to have issues',
    medium: 'Possible issues',
    low: 'Small risk',
    minimal: 'Low risk'
  },
  detail: {
    high: (v) => `Cortex predicts this endpoint will fail with ${v}% probability`,
    medium: (v) => `Cortex expects an issue with ${v}% probability`,
    low: (v) => `Cortex expects slight performance drop with ${v}% probability`,
    minimal: (v) => `Cortex expects minor fluctuation with ${v}% probability`
  },
  advice: {
    high: 'Take action now: check endpoint or switch to backup URL',
    medium: 'It is recommended to check your endpoint',
    low: 'Not concerning at the moment, being monitored',
    minimal: 'Everything looks normal'
  },
  method: { timeSeries: '🧠 Time series analysis', trend: '📊 Trend analysis' }
};
tr.cortex.predictions = {
  title: 'Gelecek Tahminleri',
  description: 'Cortex geçmiş verileri analiz ederek gelecekteki olası sorunları tahmin eder.',
  empty: { title: 'Henüz tahmin yok', description: 'Tahmin üretilmesi için en az birkaç saatlik veri gerekiyor.' },
  probability: (v) => `%${v} ihtimal`,
  severity: {
    high: 'Yüksek ihtimalle sorun çıkacak',
    medium: 'Sorun çıkma ihtimali var',
    low: 'Küçük bir risk var',
    minimal: 'Düşük risk'
  },
  detail: {
    high: (v) => `Cortex %${v} olasılıkla bu endpoint'in başarısız olacağını tahmin ediyor`,
    medium: (v) => `Cortex %${v} olasılıkla bir sorun bekliyor`,
    low: (v) => `Cortex %${v} olasılıkla hafif bir performans düşüşü bekliyor`,
    minimal: (v) => `Cortex %${v} olasılıkla küçük bir dalgalanma bekliyor`
  },
  advice: {
    high: 'Şimdi önlem alın: endpoint\'i kontrol edin veya yedek adrese geçin',
    medium: 'Endpoint\'inizi kontrol etmeniz önerilir',
    low: 'Şimdilik endişe verici değil, izleniyor',
    minimal: 'Her şey normal görünüyor'
  },
  method: { timeSeries: '🧠 Zaman serisi analizi', trend: '📊 Trend analizi' }
};

// MLQualityTab
en.cortex.mlQuality = {
  title: 'ML Model Quality',
  description: 'Accuracy of Cortex prediction models.',
  resetButton: 'Reset Low Quality Models',
  overallScore: 'Overall Quality Score',
  modelSummary: (total, healthy) => `${total} models monitored — ${healthy} healthy`,
  empty: { title: 'No model data yet', description: 'Quality metrics will appear here as Cortex prediction models collect data.', info: '📊 ML quality check runs hourly · Predictions generated every 15 minutes' },
  quality: { excellent: 'Excellent quality', good: 'Good quality', low: 'Low quality', critical: 'Critical quality' },
  detail: {
    excellent: (acc, err) => `Predictions working with ${acc}% accuracy, average error ${err}`,
    good: (acc) => `Predictions working with ${acc}% accuracy, some improvements possible`,
    low: (acc) => `Predictions working with ${acc}% accuracy — model may need reset`,
    critical: (acc) => `Predictions unreliable — ${acc}% accuracy. Model should be reset`
  },
  metric: { accuracy: 'Accuracy', avgError: 'Avg Error', predictionCount: 'Prediction Count' }
};
tr.cortex.mlQuality = {
  title: 'ML Model Kalitesi',
  description: 'Cortex\'in tahmin modellerinin doğruluğu.',
  resetButton: 'Düşük Kaliteli Modelleri Sıfırla',
  overallScore: 'Genel Kalite Skoru',
  modelSummary: (total, healthy) => `${total} model izleniyor — ${healthy} sağlıklı`,
  empty: { title: 'Henüz model verisi yok', description: 'Cortex\'in tahmin modelleri veri topladıkça kalite metrikleri burada görünecek.', info: '📊 ML kalite kontrolü her saat başı çalışır · Tahminler her 15 dakikada bir üretilir' },
  quality: { excellent: 'Mükemmel kalite', good: 'İyi kalite', low: 'Düşük kalite', critical: 'Kritik kalite' },
  detail: {
    excellent: (acc, err) => `Tahminler %${acc} doğrulukla çalışıyor, ortalama hata %${err}`,
    good: (acc) => `Tahminler %${acc} doğrulukla çalışıyor, bazı iyileştirmeler yapılabilir`,
    low: (acc) => `Tahminler %${acc} doğrulukla çalışıyor — model sıfırlanabilir`,
    critical: (acc) => `Tahminler güvenilir değil — %${acc} doğruluk. Model sıfırlanmalı`
  },
  metric: { accuracy: 'Doğruluk', avgError: 'Ort. Hata', predictionCount: 'Tahmin Sayısı' }
};

// ProactiveTab
en.cortex.proactive = {
  title: 'Proactive Protection',
  description: 'Cortex warns before issues occur.',
  stats: { activeAlerts: 'Active Alerts', critical: 'Critical', warning: 'Warning' },
  empty: { title: 'No proactive alerts', description: 'Cortex detected everything is normal.', info: '🛡️ Proactive analysis runs every 15 minutes' },
  detail: {
    latencyTrend: (v) => `Latency increasing: ${v}`,
    rateLimitRisk: (v) => `Rate limit risk: ${v}% usage`,
    stressDetection: (v) => `Server stress detected: ${v}`,
    cascadeRisk: (v) => `${v} endpoints may be affected`
  },
  advice: {
    latencyTrend: 'Check the endpoint, server may be slowing down',
    rateLimitRisk: 'Consider increasing rate limit or reducing requests',
    stressDetection: 'Check server resources',
    cascadeRisk: 'Fix the main endpoint, others may also be affected'
  }
};
tr.cortex.proactive = {
  title: 'Proaktif Koruma',
  description: 'Cortex sorun çıkmadan önce uyarı verir.',
  stats: { activeAlerts: 'Aktif Uyarı', critical: 'Kritik', warning: 'Uyarı' },
  empty: { title: 'Proaktif uyarı yok', description: 'Cortex her şeyin normal olduğunu tespit etti.', info: '🛡️ Proaktif analiz her 15 dakikada bir çalışır' },
  detail: {
    latencyTrend: (v) => `Gecikme artıyor: ${v}`,
    rateLimitRisk: (v) => `Hız sınırı riski: %${v} kullanım`,
    stressDetection: (v) => `Sunucu stresi tespit edildi: ${v}`,
    cascadeRisk: (v) => `${v} endpoint etkilenebilir`
  },
  advice: {
    latencyTrend: 'Endpoint\'i kontrol edin, sunucu yavaşlıyor olabilir',
    rateLimitRisk: 'Rate limit\'i artırmayı veya istekleri azaltmayı düşünün',
    stressDetection: 'Sunucu kaynaklarını kontrol edin',
    cascadeRisk: 'Ana endpoint\'i onarın, diğerleri de etkilenebilir'
  }
};

// DriftTab
en.cortex.drift = {
  title: 'Drift Detection Events',
  eventCount: (n) => `${n} event(s)`,
  empty: 'No drift detected yet. ML models are working normally. ✅',
  severity: 'Severity',
  affected: 'Affected:',
  detected: 'Detected:',
  action: 'Action:'
};
tr.cortex.drift = {
  title: 'Drift Tespit Olayları',
  eventCount: (n) => `${n} olay`,
  empty: 'Henüz drift tespit edilmedi. ML modelleri normal çalışıyor. ✅',
  severity: 'Şiddet',
  affected: 'Etkilenen:',
  detected: 'Tespit:',
  action: 'Aksiyon:'
};

// ModelMonitorTab
en.cortex.modelMonitor = {
  stats: { totalModels: 'Total Models', healthy: 'Healthy', warning: 'Warning', critical: 'Critical' },
  avgAccuracy: 'Avg Accuracy',
  avgF1: 'Avg F1 Score',
  worstModels: 'Worst Models'
};
tr.cortex.modelMonitor = {
  stats: { totalModels: 'Toplam Model', healthy: 'Sağlıklı', warning: 'Uyarı', critical: 'Kritik' },
  avgAccuracy: 'Ort. Accuracy',
  avgF1: 'Ort. F1 Score',
  worstModels: 'En Kötü Modeller'
};

// ABTestTab
en.cortex.abTest = {
  title: 'A/B Tests',
  testCount: (n) => `${n} test(s)`,
  empty: 'No A/B tests yet. Start a test from the API to compare models.',
  endpoint: 'Endpoint:',
  traffic: '% traffic',
  winner: (v) => `🏆 Winner: ${v}`
};
tr.cortex.abTest = {
  title: 'A/B Testleri',
  testCount: (n) => `${n} test`,
  empty: 'Henüz A/B testi yok. Model karşılaştırmaları için API\'den test başlatın.',
  endpoint: 'Endpoint:',
  traffic: '% trafik',
  winner: (v) => `🏆 Kazanan: ${v}`
};

// AutoMLTab
en.cortex.autoML = {
  title: 'AutoML Optimization Trials',
  trialCount: (n) => `${n} trial(s)`,
  empty: 'No AutoML trials yet. Start an optimization from the API.',
  best: 'Best'
};
tr.cortex.autoML = {
  title: 'AutoML Optimizasyon Denemeleri',
  trialCount: (n) => `${n} deneme`,
  empty: 'Henüz AutoML denemesi yok. API\'den optimizasyon başlatın.',
  best: 'En İyi'
};

// Security page
en.cortex.securityPage = {
  title: 'Security Monitoring',
  subtitle: 'Enterprise-grade security, startup-friendly pricing'
};
tr.cortex.securityPage = {
  title: 'Güvenlik İzleme',
  subtitle: 'Kurumsal düzeyde güvenlik, girişim dostu fiyatlandırma'
};

fs.writeFileSync('./src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('./src/messages/tr.json', JSON.stringify(tr, null, 2) + '\n');

// Verify
const enCount = JSON.stringify(en.cortex).split('"').length;
const trCount = JSON.stringify(tr.cortex).split('"').length;
console.log('EN cortex keys:', enCount);
console.log('TR cortex keys:', trCount);
console.log('Done!');
