// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

const { default: DocsPage } = await import('@/app/[locale]/docs/page');

describe('DocsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(React.createElement(DocsPage));
  });

  it('displays docs title', () => {
    const { container } = render(React.createElement(DocsPage));
    expect(container.textContent).toContain('docs.gettingStarted');
  });

  it('renders quick start section', () => {
    const { container } = render(React.createElement(DocsPage));
    expect(container.textContent).toContain('docs.quickStart');
  });

  it('renders code examples', () => {
    const { container } = render(React.createElement(DocsPage));
    expect(container.textContent).toContain('docs.codeExamples');
    expect(container.textContent).toContain('Node.js');
    expect(container.textContent).toContain('Python');
    expect(container.textContent).toContain('Go');
  });
});
