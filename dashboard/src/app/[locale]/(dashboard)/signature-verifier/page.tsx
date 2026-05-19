'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import { CheckCircle2, Laptop, PenLine, ShieldCheck, Trash2, XCircle } from 'lucide-react';

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
  const [showSecret, setShowSecret] = useState(false);
  const [activeCodeLang, setActiveCodeLang] = useState<'node' | 'python' | 'go'>('node');

  const clearAll = useCallback(() => {
    setPayload('');
    setSecret('');
    setSignature('');
    setResult(null);
  }, []);

  /** Copy with fallback for non-HTTPS environments */
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-HTTPS
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast(t('toastCopied'), 'success');
    } catch {
      toast(t('toastCopyFailed'), 'error');
    }
  }, [toast, t]);

  /** Normalize signature — auto-prepend algorithm prefix if missing */
  const normalizeSignature = useCallback((raw: string): string => {
    const trimmed = raw.trim();
    // Already has prefix like sha256= or sha512=
    if (/^sha(256|512)=/i.test(trimmed)) return trimmed;
    // Looks like a hex string — prepend current algorithm
    if (/^[0-9a-fA-F]+$/.test(trimmed)) return `${algorithm}=${trimmed}`;
    return trimmed;
  }, [algorithm]);

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
      setResult(null);
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
      const provided = normalizeSignature(signature);
      // Constant-time comparison to prevent timing attacks (Item 168)
      const isValid = timingSafeEqual(computed, provided);
      setResult(isValid ? 'valid' : 'invalid');
    } catch {
      toast(t('toastVerificationFailed'), 'error');
    } finally {
      setComputing(false);
    }
  };

  /** Keyboard shortcut: Ctrl/Cmd + Enter to verify */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (payload && secret && signature && !computing) {
        verifySignature();
      }
    }
  }, [payload, secret, signature, computing]);

  const codeExamples: Record<string, { lang: string; label: string; code: string }> = {
    node: {
      lang: 'javascript',
      label: 'Node.js',
      code: `import crypto from 'crypto';

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
}`,
    },
    python: {
      lang: 'python',
      label: 'Python',
      code: `import hmac
import hashlib

def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
    """Verify webhook signature using constant-time comparison."""
    expected = hmac.new(
        secret.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    expected_sig = f"sha256={expected}"
    return hmac.compare_digest(signature, expected_sig)

# Usage
is_valid = verify_webhook_signature(
    request.body,                              # raw body string
    request.headers["x-hooksniff-signature"],  # signature header
    os.environ["WEBHOOK_SECRET"]               # your endpoint secret
)

if not is_valid:
    return {"error": "Invalid signature"}, 401`,
    },
    go: {
      lang: 'go',
      label: 'Go',
      code: `package main

import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "fmt"
    "io"
    "net/http"
    "os"
)

func verifyWebhookSignature(payload, signature, secret string) bool {
    mac := hmac.New(sha256.New, []byte(secret))
    mac.Write([]byte(payload))
    expected := hex.EncodeToString(mac.Sum(nil))
    return hmac.Equal(
        []byte(signature),
        []byte(fmt.Sprintf("sha256=%s", expected)),
    )
}

// Usage
func handleWebhook(w http.ResponseWriter, r *http.Request) {
    body, _ := io.ReadAll(r.Body)
    sig := r.Header.Get("x-hooksniff-signature")

    if !verifyWebhookSignature(string(body), sig, os.Getenv("WEBHOOK_SECRET")) {
        http.Error(w, "Invalid signature", http.StatusUnauthorized)
        return
    }
    // Process webhook...
}`,
    },
  };

  return (
    <div className="space-y-8" onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={clearAll}
          disabled={!payload && !secret && !signature}
          className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Trash2 size={16} strokeWidth={1.75} className="inline mr-1" /> {t('clearAll')}
        </button>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
        <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 font-mono text-gray-500 dark:text-slate-400">Ctrl</kbd>
        <span>+</span>
        <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 font-mono text-gray-500 dark:text-slate-400">Enter</kbd>
        <span>{t('shortcutHint')}</span>
      </div>

      {/* Algorithm Selector */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center"><span className="text-base"><ShieldCheck size={18} strokeWidth={1.75} /></span></div>
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
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600"><PenLine size={16} strokeWidth={1.75} /></div>
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
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition font-mono placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('secretLabel')}</label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={secret}
                onChange={(e) => { setSecret(e.target.value); setResult(null); }}
                placeholder="whsec_your_secret_key"
                className="w-full px-3.5 py-2.5 pr-12 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition font-mono placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
                title={showSecret ? t('hideSecret') : t('showSecret')}
              >
                {showSecret ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.879L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('signatureLabel')}</label>
            <input
              type="text"
              value={signature}
              onChange={(e) => { setSignature(e.target.value); setResult(null); }}
              placeholder="sha256=abc123..."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition font-mono placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-slate-500">{t('signatureFormatHint')}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={verifySignature}
              disabled={computing || !payload || !secret || !signature}
              className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {computing ? t('verifying') : t('verifyBtn')}
            </button>
            <button
              onClick={computeSignature}
              disabled={computing || !payload || !secret}
              className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span className="text-2xl">{result === 'valid' ? <CheckCircle2 size={20} strokeWidth={1.75} className="text-green-500" /> : <XCircle size={20} strokeWidth={1.75} className="text-red-500" />}</span>
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

      {/* Code Example — Multi-language tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center"><span className="text-base"><Laptop size={18} strokeWidth={1.75} /></span></div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('codeExample')}</h2>
        </div>
        {/* Language tabs */}
        <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
          {Object.entries(codeExamples).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setActiveCodeLang(key as typeof activeCodeLang)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                activeCodeLang === key
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Code block */}
        <div className="relative">
          <button
            onClick={() => copyToClipboard(codeExamples[activeCodeLang].code)}
            className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition z-10"
          >
            {t('copy')}
          </button>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
            <code>{codeExamples[activeCodeLang].code}</code>
          </pre>
        </div>
      </div>
    </div>

  );
}
