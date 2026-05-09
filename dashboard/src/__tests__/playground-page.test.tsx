// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: () => React.createElement('div', null, 'Loading'),
}));

const { default: PlaygroundPage } = await import('@/app/[locale]/dashboard/playground/page');

describe('PlaygroundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders without crashing', () => {
    render(React.createElement(PlaygroundPage));
  });

  it('displays playground title', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.title');
  });

  it('renders request section', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.request');
  });

  it('renders response inspector', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.responseInspector');
  });

  it('renders cURL command section', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.curlCommand');
  });

  it('renders AI payload generator', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('AI Payload Generator');
  });

  it('renders quick presets', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.quickPresets');
  });

  it('renders send request button', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.sendRequest');
  });
});
