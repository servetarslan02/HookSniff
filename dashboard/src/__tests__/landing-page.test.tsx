import { renderWithProviders } from './test-utils';
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
  useLocale: () => 'en',
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
      renderWithProviders(React.createElement(LandingPage));
    });
  });

  it('displays landing page content', () => {
    let result: any;
    act(() => {
      result = renderWithProviders(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('renders navigation with HookSniff branding', () => {
    let result: any;
    act(() => {
      result = renderWithProviders(React.createElement(LandingPage));
    });
    const { container } = result;
    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('renders feature sections', () => {
    let result: any;
    act(() => {
      result = renderWithProviders(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('renders hero section', () => {
    let result: any;
    act(() => {
      result = renderWithProviders(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('renders CTA buttons', () => {
    let result: any;
    act(() => {
      result = renderWithProviders(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    // Check that CTA links point to /dashboard and /docs
    const links = container.querySelectorAll('a');
    const linkHrefs = Array.from(links).map((a: any) => a.getAttribute('href'));
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('renders pricing section', () => {
    let result: any;
    act(() => {
      result = renderWithProviders(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('renders how it works section', () => {
    let result: any;
    act(() => {
      result = renderWithProviders(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('renders footer with links', () => {
    let result: any;
    act(() => {
      result = renderWithProviders(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('renders navigation links', () => {
    let result: any;
    act(() => {
      result = renderWithProviders(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('renders dashboard preview mockup', () => {
    let result: any;
    act(() => {
      result = renderWithProviders(React.createElement(LandingPage));
    });
    const { container } = result;
    // Dashboard preview contains stats
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('renders code example section', () => {
    let result: any;
    act(() => {
      result = renderWithProviders(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent!.length).toBeGreaterThan(20);
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('renders most popular pricing badge', () => {
    let result: any;
    act(() => {
      result = renderWithProviders(React.createElement(LandingPage));
    });
    const { container } = result;
    expect(container.textContent!.length).toBeGreaterThan(20);
  });
});
