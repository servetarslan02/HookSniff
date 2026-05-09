// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => {
    const translations: Record<string, any> = {
      'landing.hero': {
        typewriter: ['Fast.', 'Reliable.', 'Secure.'],
      },
      'landing.pricing': {
        freeFeatures: ['feature1', 'feature2'],
        proFeatures: ['feature3', 'feature4'],
        businessFeatures: ['feature5', 'feature6'],
      },
    };
    const t = (key: string) => ns ? `${ns}.${key}` : key;
    t.raw = (key: string) => {
      if (ns && translations[ns] && translations[ns][key]) {
        return translations[ns][key];
      }
      return [`${ns}.${key}`];
    };
    return t;
  },
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('next/dynamic', () => ({
  default: () => {
    const DynamicComponent = () => React.createElement('div', null, 'Dynamic');
    return DynamicComponent;
  },
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

vi.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => React.createElement('div', null, 'ThemeToggle'),
}));

const { default: LandingPage } = await import('@/app/[locale]/page');

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    act(() => {
      render(React.createElement(LandingPage));
    });
  });

  it('displays landing page content', () => {
    let result: any;
    act(() => {
      result = render(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent).toContain('HookSniff');
  });

  it('renders navigation with HookSniff branding', () => {
    let result: any;
    act(() => {
      result = render(React.createElement(LandingPage));
    });
    const { container } = result;
    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(container.textContent).toContain('🪝');
  });

  it('renders feature sections', () => {
    let result: any;
    act(() => {
      result = render(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent).toContain('landing.features');
    expect(container.textContent).toContain('landing.features.smartRetries');
    expect(container.textContent).toContain('landing.features.hmacSignatures');
    expect(container.textContent).toContain('landing.features.dashboard');
    expect(container.textContent).toContain('landing.features.lowLatency');
    expect(container.textContent).toContain('landing.features.dlq');
    expect(container.textContent).toContain('landing.features.global');
  });

  it('renders hero section', () => {
    let result: any;
    act(() => {
      result = render(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent).toContain('landing.hero.title');
    expect(container.textContent).toContain('landing.hero.subtitle');
    expect(container.textContent).toContain('landing.hero.uptime');
  });

  it('renders CTA buttons', () => {
    let result: any;
    act(() => {
      result = render(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent).toContain('landing.hero.cta');
    expect(container.textContent).toContain('landing.hero.ctaSecondary');
    // Check that CTA links point to /dashboard and /docs
    const links = container.querySelectorAll('a');
    const linkHrefs = Array.from(links).map((a: any) => a.getAttribute('href'));
    expect(linkHrefs).toContain('/dashboard');
    expect(linkHrefs).toContain('/docs');
  });

  it('renders pricing section', () => {
    let result: any;
    act(() => {
      result = render(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent).toContain('landing.pricing');
    expect(container.textContent).toContain('$0');
    expect(container.textContent).toContain('$49');
    expect(container.textContent).toContain('$149');
    expect(container.textContent).toContain('landing.pricing.free');
    expect(container.textContent).toContain('landing.pricing.pro');
    expect(container.textContent).toContain('landing.pricing.business');
  });

  it('renders how it works section', () => {
    let result: any;
    act(() => {
      result = render(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent).toContain('landing.howItWorks');
    expect(container.textContent).toContain('landing.howItWorks.send');
    expect(container.textContent).toContain('landing.howItWorks.deliver');
    expect(container.textContent).toContain('landing.howItWorks.monitor');
  });

  it('renders footer with links', () => {
    let result: any;
    act(() => {
      result = render(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent).toContain('landing.footer');
    expect(container.textContent).toContain('landing.footer.github');
    expect(container.textContent).toContain('landing.footer.docs');
    expect(container.textContent).toContain('landing.footer.status');
    expect(container.textContent).toContain('landing.footer.about');
    expect(container.textContent).toContain('landing.footer.copyright');
  });

  it('renders navigation links', () => {
    let result: any;
    act(() => {
      result = render(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent).toContain('landing.nav.features');
    expect(container.textContent).toContain('landing.nav.pricing');
    expect(container.textContent).toContain('landing.nav.docs');
    expect(container.textContent).toContain('landing.nav.status');
    expect(container.textContent).toContain('landing.nav.dashboard');
  });

  it('renders dashboard preview mockup', () => {
    let result: any;
    act(() => {
      result = render(React.createElement(LandingPage));
    });
    const { container } = result;
    // Dashboard preview contains stats
    expect(container.textContent).toContain('24,891');
    expect(container.textContent).toContain('99.97%');
    expect(container.textContent).toContain('45ms');
  });

  it('renders code example section', () => {
    let result: any;
    act(() => {
      result = render(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent).toContain('send-webhook.sh');
    expect(container.textContent).toContain('curl -X POST');
  });

  it('renders most popular pricing badge', () => {
    let result: any;
    act(() => {
      result = render(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent).toContain('landing.pricing.mostPopular');
  });
});
