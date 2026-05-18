import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Event Processing',
  description: 'How HookSniff processes events from ingestion to delivery',
};

export default async function EventProcessingPage() {
  const t = await getTranslations('docsEventProcessing');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* Lifecycle */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('lifecycle')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('lifecycleDesc')}</p>
        <ol className="space-y-4 text-gray-600 dark:text-slate-400">
          <li><strong>1. {t('stage1').split(' — ')[0]}</strong> — {t('stage1').split(' — ')[1]}</li>
          <li><strong>2. {t('stage2').split(' — ')[0]}</strong> — {t('stage2').split(' — ')[1]}</li>
          <li><strong>3. {t('stage3').split(' — ')[0]}</strong> — {t('stage3').split(' — ')[1]}</li>
          <li><strong>4. {t('stage4').split(' — ')[0]}</strong> — {t('stage4').split(' — ')[1]}</li>
          <li><strong>5. {t('stage5').split(' — ')[0]}</strong> — {t('stage5').split(' — ')[1]}</li>
          <li><strong>6. {t('stage6').split(' — ')[0]}</strong> — {t('stage6').split(' — ')[1]}</li>
          <li><strong>7. {t('stage7').split(' — ')[0]}</strong> — {t('stage7').split(' — ')[1]}</li>
        </ol>
      </section>

      {/* Ingestion */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('ingestion')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('ingestionDesc')}</p>
        <ol className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>1. {t('ingestionStep1')}</li>
          <li>2. {t('ingestionStep2')}</li>
          <li>3. {t('ingestionStep3')}</li>
          <li>4. {t('ingestionStep4')}</li>
          <li>5. {t('ingestionStep5')}</li>
          <li>6. {t('ingestionStep6')}</li>
          <li>7. {t('ingestionStep7')}</li>
        </ol>
      </section>

      {/* Routing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('routing')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('routingDesc')}</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('routingExact')}</li>
          <li>{t('routingWildcard')}</li>
          <li>{t('routingAll')}</li>
        </ul>
      </section>

      {/* Delivery */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('delivery')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('deliveryDesc')}</p>
        <ol className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>1. {t('deliveryStep1')}</li>
          <li>2. {t('deliveryStep2')}</li>
          <li>3. {t('deliveryStep3')}</li>
          <li>4. {t('deliveryStep4')}</li>
          <li>5. {t('deliveryStep5')}</li>
          <li>6. {t('deliveryStep6')}</li>
        </ol>
      </section>

      {/* Payload Signing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payload İmzalama</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Teslimattan önce, HookSniff payload'ı HMAC-SHA256 kullanarak imzalar:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>İmza: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">v1,{'{'}base64(hmac_sha256(secret, body)){'}'}</code></li>
          <li>Zaman damgası: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">X-HookSniff-Timestamp</code> (Unix saniye)</li>
          <li>Teslimat ID: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">X-HookSniff-Delivery-Id</code></li>
        </ul>
      </section>

      {/* Fanout */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fanout</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Bir olay birden fazla uç noktaya teslim edilebilir. <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.created</code>'ı dinleyen 5 uç noktanız varsa, HookSniff 5 ayrı teslimat oluşturur — her birinin kendi imza gizli anahtarı, tekrar politikası ve teslimat takibi vardır.
        </p>
      </section>

      {/* Ordering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sıralama</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff olayları uç nokta başına FIFO sırasıyla teslim eder. Her teslimat bir sıra numarası içerir. Bir teslimat başarısız olup tekrar denendiğinde, aynı uç noktaya yapılan sonraki teslimatlar tekrar tamamlanana kadar bekletilir.
        </p>
      </section>

      {/* Timeouts */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Zaman Aşımları</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Her teslimat denemesinin 30 saniyelik bir zaman aşımı vardır. Uç noktanız 30 saniye içinde yanıt vermezse, deneme başarısız olarak işaretlenir ve tekrar denenir.
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          <strong>En iyi uygulama:</strong> Hemen 200 döndürün ve asenkron işleyin. <Link href="/docs/best-practices" className="text-brand-600 hover:text-brand-700">En İyi Uygulamalar</Link>'a bakın.
        </p>
      </section>
    </article>
  );
}
