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

const { default: ApiReferencePage } = await import('@/app/[locale]/docs/api/page');

describe('ApiReferencePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(React.createElement(ApiReferencePage));
  });

  it('displays API reference title', () => {
    const { container } = render(React.createElement(ApiReferencePage));
    expect(container.textContent).toContain('docs.apiReference');
  });

  it('renders endpoint sections', () => {
    const { container } = render(React.createElement(ApiReferencePage));
    expect(container.textContent).toContain('docs.endpointsApi');
    expect(container.textContent).toContain('/endpoints');
    expect(container.textContent).toContain('docs.listEndpoints');
    expect(container.textContent).toContain('docs.createEndpointApi');
    expect(container.textContent).toContain('docs.deleteEndpointApi');
  });

  it('renders webhooks API section', () => {
    const { container } = render(React.createElement(ApiReferencePage));
    expect(container.textContent).toContain('docs.webhooksApi');
    expect(container.textContent).toContain('/webhooks');
    expect(container.textContent).toContain('docs.sendWebhookApi');
    expect(container.textContent).toContain('docs.listWebhooksApi');
    expect(container.textContent).toContain('docs.getWebhookApi');
  });

  it('renders stats API section', () => {
    const { container } = render(React.createElement(ApiReferencePage));
    expect(container.textContent).toContain('docs.statsApi');
    expect(container.textContent).toContain('/stats');
    expect(container.textContent).toContain('docs.getStatsApi');
  });

  it('renders code examples with request and response blocks', () => {
    const { container } = render(React.createElement(ApiReferencePage));
    const codeBlocks = container.querySelectorAll('pre');
    // Should have multiple pre blocks for request/response JSON examples
    expect(codeBlocks.length).toBeGreaterThanOrEqual(6);
  });

  it('renders HTTP method badges', () => {
    const { container } = render(React.createElement(ApiReferencePage));
    expect(container.textContent).toContain('GET');
    expect(container.textContent).toContain('POST');
    expect(container.textContent).toContain('DELETE');
  });

  it('renders error codes section', () => {
    const { container } = render(React.createElement(ApiReferencePage));
    expect(container.textContent).toContain('docs.errorCodes');
    expect(container.textContent).toContain('400');
    expect(container.textContent).toContain('401');
    expect(container.textContent).toContain('404');
    expect(container.textContent).toContain('429');
    expect(container.textContent).toContain('500');
  });

  it('renders error format section', () => {
    const { container } = render(React.createElement(ApiReferencePage));
    expect(container.textContent).toContain('docs.errorFormat');
  });
});
