// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, waitFor, cleanup } from '@testing-library/react';

const mockPush = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUseAuth = vi.fn();
vi.mock('@/lib/store', () => ({
  useAuth: () => mockUseAuth(),
}));

import { AuthGuard } from '@/components/AuthGuard';

function renderWithAuth(ui: React.ReactNode) {
  return render(<AuthGuard>{ui}</AuthGuard>);
}

describe('AuthGuard', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockPush.mockReset();
  });

  // === Loading State ===
  it('shows loading spinner when isLoading is true', () => {
    mockUseAuth.mockReturnValue({ token: null, isLoading: true });
    const { container } = renderWithAuth(<div>Protected Content</div>);
    expect(container.textContent).toContain('Loading...');
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('does not render children while loading', () => {
    mockUseAuth.mockReturnValue({ token: null, isLoading: true });
    const { container } = renderWithAuth(<div>Protected Content</div>);
    expect(container.textContent).not.toContain('Protected Content');
  });

  // === No Token (Redirecting) ===
  it('shows redirecting message when not loading and no token', () => {
    mockUseAuth.mockReturnValue({ token: null, isLoading: false });
    const { container } = renderWithAuth(<div>Protected Content</div>);
    expect(container.textContent).toContain('Redirecting to login...');
  });

  it('does not render children when there is no token', () => {
    mockUseAuth.mockReturnValue({ token: null, isLoading: false });
    const { container } = renderWithAuth(<div>Protected Content</div>);
    expect(container.textContent).not.toContain('Protected Content');
  });

  it('redirects to /login when not loading and no token', async () => {
    mockUseAuth.mockReturnValue({ token: null, isLoading: false });
    renderWithAuth(<div>Protected Content</div>);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('does not redirect while loading', () => {
    mockUseAuth.mockReturnValue({ token: null, isLoading: true });
    renderWithAuth(<div>Protected Content</div>);
    expect(mockPush).not.toHaveBeenCalled();
  });

  // === Authenticated (Token Present) ===
  it('renders children when token is present and not loading', () => {
    mockUseAuth.mockReturnValue({ token: 'valid-jwt-token', isLoading: false });
    const { container } = renderWithAuth(<div>Protected Content</div>);
    expect(container.textContent).toContain('Protected Content');
  });

  it('does not show loading spinner when authenticated', () => {
    mockUseAuth.mockReturnValue({ token: 'valid-jwt-token', isLoading: false });
    const { container } = renderWithAuth(<div>Protected Content</div>);
    expect(container.textContent).not.toContain('Loading...');
    expect(container.textContent).not.toContain('Redirecting');
  });

  it('does not redirect when authenticated', () => {
    mockUseAuth.mockReturnValue({ token: 'valid-jwt-token', isLoading: false });
    renderWithAuth(<div>Protected Content</div>);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('renders multiple children when authenticated', () => {
    mockUseAuth.mockReturnValue({ token: 'valid-jwt-token', isLoading: false });
    const { container } = renderWithAuth(
      <>
        <div>Child 1</div>
        <div>Child 2</div>
      </>
    );
    expect(container.textContent).toContain('Child 1');
    expect(container.textContent).toContain('Child 2');
  });

  // === Transition: Loading → Authenticated ===
  it('transitions from loading to authenticated content', () => {
    mockUseAuth.mockReturnValue({ token: null, isLoading: true });
    const { container, rerender } = renderWithAuth(<div>Protected Content</div>);
    expect(container.textContent).toContain('Loading...');

    mockUseAuth.mockReturnValue({ token: 'valid-token', isLoading: false });
    rerender(<AuthGuard><div>Protected Content</div></AuthGuard>);
    expect(container.textContent).toContain('Protected Content');
    expect(container.textContent).not.toContain('Loading...');
  });

  // === Transition: Loading → Not Authenticated ===
  it('transitions from loading to redirect when no token', async () => {
    mockUseAuth.mockReturnValue({ token: null, isLoading: true });
    const { container, rerender } = renderWithAuth(<div>Protected Content</div>);
    expect(container.textContent).toContain('Loading...');

    mockUseAuth.mockReturnValue({ token: null, isLoading: false });
    rerender(<AuthGuard><div>Protected Content</div></AuthGuard>);
    expect(container.textContent).toContain('Redirecting to login...');
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  // === Edge Cases ===
  it('handles empty string token as falsy', () => {
    mockUseAuth.mockReturnValue({ token: '', isLoading: false });
    const { container } = renderWithAuth(<div>Protected Content</div>);
    expect(container.textContent).toContain('Redirecting to login...');
  });

  it('renders spinner with correct styling', () => {
    mockUseAuth.mockReturnValue({ token: null, isLoading: true });
    const { container } = renderWithAuth(<div>Protected Content</div>);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
    expect(spinner!.className).toContain('rounded-full');
    expect(spinner!.className).toContain('border-b-2');
  });

  it('uses min-h-screen for full page layout in loading state', () => {
    mockUseAuth.mockReturnValue({ token: null, isLoading: true });
    const { container } = renderWithAuth(<div>Protected Content</div>);
    const wrapper = container.querySelector('.min-h-screen');
    expect(wrapper).toBeTruthy();
    expect(wrapper!.className).toContain('flex');
    expect(wrapper!.className).toContain('items-center');
    expect(wrapper!.className).toContain('justify-center');
  });

  it('uses min-h-screen for redirect state too', () => {
    mockUseAuth.mockReturnValue({ token: null, isLoading: false });
    const { container } = renderWithAuth(<div>Protected Content</div>);
    const wrapper = container.querySelector('.min-h-screen');
    expect(wrapper).toBeTruthy();
  });
});
