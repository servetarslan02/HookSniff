'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';

/** Constant-time string comparison to prevent timing attacks (Item 168) */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }
  return result === 0;
}

/* ─── Signature Verifier Tool ─── */
export default function SignatureVerifierPage() {
  const t = useTranslations('signatureVerifier');
  const { toast } = useToast();
  const [payload, setPayload] = useState('');
  const [secret, setSecret] = useState('');
  const [signature, setSignature] = useState('');
  const [algorithm, setAlgorithm] = useState<'sha256' | 'sha512'>('sha256');
  const [result, setResult] = useState<'valid' | 'invalid' | null>(null);
  const [computing, setComputing] = useState(false);

  const computeSignature = async () => {
    if (!payload || !secret) {
      toast(t('toastPayloadRequired'), 'error');
      return;
    }
    setComputing(true);
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: algorithm === 'sha256' ? 'SHA-256' : 'SHA-512' },
        false,
        ['sign']
      );
      const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
      const sigHex = Array.from(new Uint8Array(sigBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const computed = `${algorithm}=${sigHex}`;
      setSignature(computed);
      toast(t('toastSignatureComputed'), 'success');
    } catch {
      toast(t('toastComputeFailed'), 'error');
    } finally {
      setComputing(false);
    }
  };

  const verifySignature = async () => {
    if (!payload || !secret || !signature) {
      toast(t('toastAllRequired'), 'error');
      return;
    }
    setComputing(true);
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: algorithm === 'sha256' ? 'SHA-256' : 'SHA-512' },
        false,
        ['sign']
      );
      const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
      const sigHex = Array.from(new Uint8Array(sigBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const computed = `${algorithm}=${sigHex}`;
      const provided = signature.trim();
      // Constant-time comparison to prevent timing attacks (Item 168)
      const isValid = timingSafeEqual(computed, provided);
      setResult(isValid ? 'valid' : 'invalid');
    } catch {
      toast(t('toastVerificationFailed'), 'error');
    } finally {
      setComputing(false);
    }
  };

  const sampleCode = `// Node.js — Verify webhook signature
import crypto from 'crypto';

function verifyWebhookSignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  const expectedSig = \`sha256=\${expected}\`;
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );
}

// Usage
const isValid = verifyWebhookSignature(
  req.body,                              // raw body string
  req.headers['x-hooksniff-signature'],  // signature header
  process.env.WEBHOOK_SECRET             // your endpoint secret
);

if (!isValid) {
  return res.status(401).json({ error: 'Invalid signature' });
}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Algorithm Selector */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center"><span className="text-base">🔐</span></div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('algorithm')}</h2>
        </div>
        <div className="flex gap-3">
          {(['sha256', 'sha512'] as const).map((alg) => (
            <button
              key={alg}
              onClick={() => { setAlgorithm(alg); setResult(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                algorithm === alg
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              {alg === 'sha256' ? 'HMAC-SHA256' : 'HMAC-SHA512'}
            </button>
          ))}
        </div>
      </div>

      {/* Verify Tool */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center"><span className="text-base">✍️</span></div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('verifySignature')}</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('payloadLabel')}</label>
            <textarea
              value={payload}
              onChange={(e) => { setPayload(e.target.value); setResult(null); }}
              placeholder='{"event":"order.created","data":{"id":"ord_123"}}'
              rows={4}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition font-mono text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('secretLabel')}</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => { setSecret(e.target.value); setResult(null); }}
              placeholder="whsec_your_secret_key"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition font-mono text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('signatureLabel')}</label>
            <input
              type="text"
              value={signature}
              onChange={(e) => { setSignature(e.target.value); setResult(null); }}
              placeholder="sha256=abc123..."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition font-mono text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={verifySignature}
              disabled={computing || !payload || !secret || !signature}
              className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
            >
              {computing ? t('verifying') : t('verifyBtn')}
            </button>
            <button
              onClick={computeSignature}
              disabled={computing || !payload || !secret}
              className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              {t('computeBtn')}
            </button>
          </div>
          {result && (
            <div className={`p-4 rounded-xl ${
              result === 'valid'
                ? 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20'
                : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{result === 'valid' ? '✅' : '❌'}</span>
                <div>
                  <div className={`font-semibold ${result === 'valid' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {result === 'valid' ? t('signatureValid') : t('signatureInvalid')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">
                    {result === 'valid'
                      ? t('validDesc')
                      : t('invalidDesc')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center"><span className="text-base">💻</span></div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('codeExample')}</h2>
        </div>
        <div className="relative">
          <button
            onClick={() => { navigator.clipboard.writeText(sampleCode); toast(t('toastCopied'), 'success'); }}
            className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
          >
            {t('copy')}
          </button>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
            <code>{sampleCode}</code>
          </pre>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center"><span className="text-base">📖</span></div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('howItWorks')}</h2>
        </div>
        <div className="space-y-4">
          {[
            { step: '1', title: t('step1Title'), desc: t('step1Desc') },
            { step: '2', title: t('step2Title'), desc: t('step2Desc') },
            { step: '3', title: t('step3Title'), desc: t('step3Desc') },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm shrink-0">
                {item.step}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
