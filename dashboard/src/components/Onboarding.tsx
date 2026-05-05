'use client';

import { useState, useEffect } from 'react';

interface Step {
  title: string;
  description: string;
  illustration: React.ReactNode;
  cta: string;
  ctaAction?: () => void;
}

const STORAGE_KEY = 'hookrelay_onboarding_completed';

function CheckIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function WelcomeIllustration() {
  return (
    <svg className="w-24 h-24" viewBox="0 0 96 96" fill="none">
      <circle cx="48" cy="48" r="40" className="fill-brand-100 dark:fill-brand-500/10" />
      <path d="M36 44l8 8 16-16" className="stroke-brand-600 dark:stroke-brand-400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="48" cy="48" r="28" className="stroke-brand-300 dark:stroke-brand-500/30" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  );
}

function EndpointIllustration() {
  return (
    <svg className="w-24 h-24" viewBox="0 0 96 96" fill="none">
      <rect x="16" y="30" width="64" height="36" rx="8" className="fill-brand-100 dark:fill-brand-500/10" />
      <circle cx="36" cy="48" r="8" className="fill-brand-500 dark:fill-brand-400" />
      <path d="M50 42h20M50 48h14M50 54h18" className="stroke-brand-400 dark:stroke-brand-500/50" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WebhookIllustration() {
  return (
    <svg className="w-24 h-24" viewBox="0 0 96 96" fill="none">
      <circle cx="48" cy="48" r="28" className="fill-brand-100 dark:fill-brand-500/10" />
      <path d="M32 48h32" className="stroke-brand-500 dark:stroke-brand-400" strokeWidth="3" strokeLinecap="round" />
      <path d="M56 40l8 8-8 8" className="stroke-brand-500 dark:stroke-brand-400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="48" r="4" className="fill-brand-500 dark:fill-brand-400" />
    </svg>
  );
}

function MonitorIllustration() {
  return (
    <svg className="w-24 h-24" viewBox="0 0 96 96" fill="none">
      <rect x="18" y="24" width="60" height="40" rx="6" className="fill-brand-100 dark:fill-brand-500/10" />
      <path d="M30 52l8-8 6 6 8-10 6 6" className="stroke-brand-500 dark:stroke-brand-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="38" y1="64" x2="38" y2="72" className="stroke-brand-400 dark:stroke-brand-500/50" strokeWidth="2" />
      <line x1="58" y1="64" x2="58" y2="72" className="stroke-brand-400 dark:stroke-brand-500/50" strokeWidth="2" />
      <line x1="30" y1="72" x2="66" y2="72" className="stroke-brand-400 dark:stroke-brand-500/50" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Onboarding({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    onComplete?.();
  };

  const nextStep = () => {
    if (currentStep === steps.length - 1) {
      dismiss();
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  const steps: Step[] = [
    {
      title: 'Welcome to Hookrelay! 🪝',
      description: 'You\'re all set up. Let\'s walk through the basics so you can start sending webhooks in minutes.',
      illustration: <WelcomeIllustration />,
      cta: 'Get started',
    },
    {
      title: 'Create your first endpoint',
      description: 'An endpoint is a URL where we\'ll deliver your webhooks. Add your server URL and we\'ll start sending.',
      illustration: <EndpointIllustration />,
      cta: 'Create endpoint',
      ctaAction: () => window.location.href = '/dashboard/endpoints',
    },
    {
      title: 'Send your first webhook',
      description: 'Use our API or dashboard to send a test webhook to your endpoint. We\'ll handle retries and signing.',
      illustration: <WebhookIllustration />,
      cta: 'Send webhook',
      ctaAction: () => window.location.href = '/dashboard/playground',
    },
    {
      title: 'Monitor deliveries',
      description: 'Track every webhook delivery in real-time. See success rates, debug failures, and monitor performance.',
      illustration: <MonitorIllustration />,
      cta: 'Go to dashboard',
    },
  ];

  if (!visible) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'bg-brand-500 w-8'
                    : i < currentStep
                    ? 'bg-brand-300 dark:bg-brand-600'
                    : 'bg-gray-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Illustration */}
          <div className="flex justify-center mb-6">
            {step.illustration}
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h2>
            <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={dismiss}
              className="text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
            >
              Skip tour
            </button>
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(s => s - 1)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  Back
                </button>
              )}
              <button
                onClick={step.ctaAction || nextStep}
                className="px-6 py-2.5 bg-brand-600 dark:bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition btn-ripple"
              >
                {step.cta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Hook to check if onboarding should show */
export function useOnboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    setShow(!completed);
  }, []);

  return { show, dismiss: () => { localStorage.setItem(STORAGE_KEY, 'true'); setShow(false); } };
}
