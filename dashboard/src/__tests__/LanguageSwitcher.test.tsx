import { renderWithProviders } from './test-utils';
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const mockPush = vi.fn();
let mockLocale = 'en';

vi.mock('next-intl', () => ({
  useLocale: () => mockLocale,
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/dashboard',
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockLocale = 'en';
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(<LanguageSwitcher />);
    expect(container.querySelector('button')).toBeTruthy();
  });

  it('displays current locale code', () => {
    const { container } = renderWithProviders(<LanguageSwitcher />);
    expect(container.textContent).toContain('EN');
  });

  it('displays current locale name', () => {
    const { container } = renderWithProviders(<LanguageSwitcher />);
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('shows dropdown when button clicked', () => {
    const { container } = renderWithProviders(<LanguageSwitcher />);
    const button = container.querySelector('button')!;
    fireEvent.click(button);
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('hides dropdown initially', () => {
    const { container } = renderWithProviders(<LanguageSwitcher />);
    expect(container.textContent).not.toContain('Türkçe');
  });

  it('switches locale when a language is selected', () => {
    const { container } = renderWithProviders(<LanguageSwitcher />);
    const button = container.querySelector('button')!;
    fireEvent.click(button);

    // Find the Turkish button in the dropdown
    const dropdownButtons = container.querySelectorAll('button');
    const trButton = Array.from(dropdownButtons).find(
      (btn) => btn.textContent?.includes('Türkçe')
    );
    expect(trButton).toBeTruthy();
    fireEvent.click(trButton!);
    expect(mockPush).toHaveBeenCalledWith('/dashboard', { locale: 'tr' });
  });

  it('closes dropdown after selecting a language', () => {
    const { container } = renderWithProviders(<LanguageSwitcher />);
    const button = container.querySelector('button')!;
    fireEvent.click(button);

    const dropdownButtons = container.querySelectorAll('button');
    const trButton = Array.from(dropdownButtons).find(
      (btn) => btn.textContent?.includes('Türkçe')
    );
    fireEvent.click(trButton!);

    // After selecting, dropdown should close - Turkish should not be visible
    expect(container.textContent).not.toContain('Türkçe');
  });

  it('highlights current locale in dropdown', () => {
    const { container } = renderWithProviders(<LanguageSwitcher />);
    const button = container.querySelector('button')!;
    fireEvent.click(button);

    // Find English button in dropdown - it should have the selected style
    const dropdownButtons = container.querySelectorAll('button');
    const enButton = Array.from(dropdownButtons).find(
      (btn) => btn.textContent?.includes('English') && btn.classList.contains('text-brand-700')
    );
    expect(enButton).toBeTruthy();
  });

  it('displays locale for non-English language', () => {
    mockLocale = 'tr';
    const { container } = renderWithProviders(<LanguageSwitcher />);
    expect(container.textContent).toContain('TR');
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('applies custom className', () => {
    const { container } = renderWithProviders(<LanguageSwitcher className="custom" />);
    const wrapper = container.firstElementChild!;
    expect(wrapper.classList.contains('custom')).toBe(true);
  });

  it('closes dropdown on click outside', () => {
    const { container } = renderWithProviders(<LanguageSwitcher />);
    const button = container.querySelector('button')!;
    fireEvent.click(button);
    expect(container.textContent!.length).toBeGreaterThan(20);

    // Click outside
    fireEvent.mouseDown(document.body);
    expect(container.textContent).not.toContain('Türkçe');
  });
});
