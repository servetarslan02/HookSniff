'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useRouter } from '@/i18n/navigation';
import { endpointsApi } from '@/lib/api';
import type { OnboardingState, WizardStep } from './onboarding/types';
import { loadState, saveState, SDKS } from './onboarding/types';
import { Confetti } from './onboarding/Confetti';
import { SetupChecklist } from './onboarding/SetupChecklist';
import { SuccessToast } from './onboarding/SuccessToast';

export { SetupChecklist, SuccessToast };

/* ─── Main Wizard Component ─── */
export function OnboardingWizard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<OnboardingState>(loadState());
  const [showConfetti, setShowConfetti] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState('');
  const [endpointDesc, setEndpointDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [selectedSdk, setSelectedSdk] = useState('nodejs');
  const [copied, setCopied] = useState('');
  const t = useTranslations('onboarding');

  const USE_CASES = [
    { id: 'payments', icon: '💳', label: t('useCasePayments'), desc: t('useCasePaymentsDesc') },
    { id: 'email', icon: '📧', label: t('useCaseEmail'), desc: t('useCaseEmailDesc') },
    { id: 'ecommerce', icon: '🛒', label: t('useCaseEcommerce'), desc: t('useCaseEcommerceDesc') },
    { id: 'saas', icon: '📊', label: t('useCaseSaas'), desc: t('useCaseSaasDesc') },
    { id: 'ai', icon: '🤖', label: t('useCaseAi'), desc: t('useCaseAiDesc') },
    { id: 'other', icon: '⚙️', label: t('useCaseOther'), desc: t('useCaseOtherDesc') },
  ];

  useEffect(() => {
    if (user && !state.dismissed) {
      setVisible(true);
    }
  }, [user, state.dismissed]);

  const updateState = useCallback((patch: Partial<OnboardingState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveState(next);
      return next;
    });
  }, []);

  const dismiss = useCallback(() => {
    updateState({ dismissed: true });
    setVisible(false);
  }, [updateState]);

  const completeStep = useCallback((stepId: string) => {
    setState((prev) => {
      const completed = [...new Set([...prev.completedSteps, stepId])];
      const next = { ...prev, completedSteps: completed };
      saveState(next);
      return next;
    });
  }, []);

  const steps: WizardStep[] = [
    { id: 'welcome', title: t('welcomeTitle'), description: t('welcomeWizardDesc'), icon: '🎉' },
    { id: 'usecase', title: t('whatBuilding'), description: t('whatBuildingDesc'), icon: '🎯' },
    { id: 'sdk', title: t('chooseSdk'), description: t('chooseSdkDesc'), icon: '📦' },
    { id: 'endpoint', title: t('createFirstEndpoint'), description: t('createFirstEndpointDesc'), icon: '🔗' },
    { id: 'test', title: t('sendTestWebhook'), description: t('sendTestWebhookDesc'), icon: '🧪' },
    { id: 'done', title: t('allSetTitle'), description: t('allSetDesc'), icon: '✅' },
  ];

  const currentStep = steps[state.currentStep];
  const progress = ((state.currentStep + 1) / steps.length) * 100;

  const goNext = () => {
    if (state.currentStep < steps.length - 1) {
      updateState({ currentStep: state.currentStep + 1 });
    }
  };

  const goBack = () => {
    if (state.currentStep > 0) {
      updateState({ currentStep: state.currentStep - 1 });
    }
  };

  const handleCreateEndpoint = async () => {
    if (!token || !endpointUrl) return;
    setCreating(true);
    setError('');
    try {
      await endpointsApi.create(token, {
        url: endpointUrl,
        description: endpointDesc || undefined,
      });
      updateState({ endpointCreated: true });
      completeStep('endpoint');
      goNext();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create endpoint');
    } finally {
      setCreating(false);
    }
  };

  const handleFinish = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    dismiss();
    router.push("/applications");
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  if (!visible || !user) return null;

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 dark:bg-slate-800">
            <div
              className="h-full bg-linear-to-r from-brand-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 pt-6 pb-2">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => i < state.currentStep && updateState({ currentStep: i })}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === state.currentStep
                    ? 'bg-brand-500 w-8'
                    : i < state.currentStep || state.completedSteps.includes(s.id)
                    ? 'bg-green-400 dark:bg-green-500'
                    : 'bg-gray-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="p-8 min-h-[320px]">
            {currentStep.id === 'welcome' && (
              <div className="text-center">
                <div className="text-6xl mb-4">🪝</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('welcome')} {user.name || user.email.split('@')[0]}!
                </h2>
                <p className="text-gray-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                  {t('welcomeDesc')}
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-slate-400">
                  <span>✓ {t('freeForever')}</span>
                  <span>✓ 11 SDK</span>
                  <span>✓ 5 dk kurulum</span>
                </div>
              </div>
            )}

            {currentStep.id === 'usecase' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">{t('whatBuilding')}</h2>
                <p className="text-gray-500 dark:text-slate-400 text-center mb-6 text-sm">{t('whatBuildingDesc')}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {USE_CASES.map((uc) => (
                    <button
                      key={uc.id}
                      onClick={() => {
                        updateState({ useCase: uc.id });
                        completeStep('usecase');
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        state.useCase === uc.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">{uc.icon}</div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{uc.label}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{uc.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep.id === 'sdk' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">{t("chooseSdk")}</h2>
                <p className="text-gray-500 dark:text-slate-400 text-center mb-6 text-sm">{t('chooseSdkDesc')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6 max-h-48 overflow-y-auto">
                  {SDKS.map((sdk) => (
                    <button
                      key={sdk.id}
                      onClick={() => {
                        setSelectedSdk(sdk.id);
                        completeStep('sdk');
                      }}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        selectedSdk === sdk.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{sdk.label}</div>
                    </button>
                  ))}
                </div>
                <div className="bg-gray-900 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{t("installCommand")}</span>
                    <button
                      onClick={() => handleCopy(SDKS.find(s => s.id === selectedSdk)?.install || '', 'install')}
                      className="px-2 py-1 text-xs font-medium rounded-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
                    >
                      {copied === 'install' ? '✓ Kopyalandı!' : 'Kopyala'}
                    </button>
                  </div>
                  <code className="text-green-400 text-sm font-mono">
                    {SDKS.find(s => s.id === selectedSdk)?.install}
                  </code>
                </div>
              </div>
            )}

            {currentStep.id === 'endpoint' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">{t("createFirstEndpoint")}</h2>
                <p className="text-gray-500 dark:text-slate-400 text-center mb-6 text-sm">{t('createFirstEndpointDesc')}</p>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-500/20">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('endpointUrl')} *</label>
                    <input
                      type="url"
                      value={endpointUrl}
                      onChange={(e) => setEndpointUrl(e.target.value)}
                      placeholder={t('endpointUrlPlaceholder')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('descriptionOptional')}</label>
                    <input
                      type="text"
                      value={endpointDesc}
                      onChange={(e) => setEndpointDesc(e.target.value)}
                      placeholder={t("descPlaceholder")}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-3">
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      💡 <strong>{t('noRealUrl')}</strong> {t('usePlayground')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep.id === 'test' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">{t("sendTestWebhook")}</h2>
                <p className="text-gray-500 dark:text-slate-400 text-center mb-6 text-sm">{t('sendTestWebhookDesc')}</p>

                <div className="bg-gray-900 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{t("testCommand")}</span>
                    <button
                      onClick={() => handleCopy(`curl -X POST https://api.hooksniff.dev/v1/webhooks \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"endpoint_id":"ep_YOUR_ID","event":"test.ping","data":{"hello":"world"}}'`, 'test')}
                      className="px-2 py-1 text-xs font-medium rounded-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
                    >
                      {copied === 'test' ? '✓ Kopyalandı!' : 'Kopyala'}
                    </button>
                  </div>
                  <pre className="text-sm font-mono text-green-400 overflow-x-auto">
                    <code>{`curl -X POST https://api.hooksniff.dev/v1/webhooks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_id": "ep_YOUR_ID",
    "event": "test.ping",
    "data": {"hello": "world"}
  }'`}</code>
                  </pre>
                </div>

                <div className="flex gap-3 justify-center">
                  <a
                    href="/devtools"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition"
                  >
                    🧪 {t('playground')}
                  </a>
                  <button
                    onClick={() => {
                      updateState({ firstWebhookSent: true });
                      completeStep('test');
                      goNext();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    ✓ {t('iveSentTest')}
                  </button>
                </div>
              </div>
            )}

            {currentStep.id === 'done' && (
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('allSetTitle')}</h2>
                <p className="text-gray-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                  {t('allSetDesc')}
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
                  <a href="/core" className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-center hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                    <div className="text-xl mb-1">🔗</div>
                    <div className="text-xs font-medium text-gray-700 dark:text-slate-300">{t("endpoints")}</div>
                  </a>
                  <a href="/core" className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-center hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                    <div className="text-xl mb-1">📦</div>
                    <div className="text-xs font-medium text-gray-700 dark:text-slate-300">{t("deliveries")}</div>
                  </a>
                  <a href="/devtools" className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-center hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                    <div className="text-xl mb-1">🧪</div>
                    <div className="text-xs font-medium text-gray-700 dark:text-slate-300">{t("playground")}</div>
                  </a>
                  <a href="/core" className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-center hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                    <div className="text-xl mb-1">🔑</div>
                    <div className="text-xs font-medium text-gray-700 dark:text-slate-300">{t("apiKeys")}</div>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-8 pb-6 flex items-center justify-between">
            <div>
              {state.currentStep > 0 && currentStep.id !== 'done' && (
                <button
                  onClick={goBack}
                  className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition"
                >
                  ← {t('back')}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {currentStep.id !== 'done' && (
                <button
                  onClick={dismiss}
                  className="text-sm text-gray-500 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
                >
                  {t('skipSetup')}
                </button>
              )}
              {currentStep.id === 'welcome' && (
                <button
                  onClick={() => { completeStep('welcome'); goNext(); }}
                  className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition"
                >
                  {t('letsGo')}
                </button>
              )}
              {currentStep.id === 'usecase' && (
                <button
                  onClick={goNext}
                  disabled={!state.useCase}
                  className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('continue')}
                </button>
              )}
              {currentStep.id === 'sdk' && (
                <button
                  onClick={goNext}
                  className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition"
                >
                  {t('continue')}
                </button>
              )}
              {currentStep.id === 'endpoint' && (
                <button
                  onClick={handleCreateEndpoint}
                  disabled={creating || !endpointUrl}
                  className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? t('creating') : t('createEndpointBtn')}
                </button>
              )}
              {currentStep.id === 'test' && (
                <button
                  onClick={goNext}
                  className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition"
                >
                  {t('continue')}
                </button>
              )}
              {currentStep.id === 'done' && (
                <button
                  onClick={handleFinish}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"
                >
                  {t('goToDashboardBtn')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OnboardingWizard;
