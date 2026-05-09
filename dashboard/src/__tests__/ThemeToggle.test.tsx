// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/ThemeToggle';

const mockToggle = vi.fn();
let mockTheme = 'light';

vi.mock('@/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: mockTheme,
    toggle: mockToggle,
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockToggle.mockClear();
    mockTheme = 'light';
  });

  it('renders without crashing', () => {
    const { container } = render(<ThemeToggle />);
    expect(container.querySelector('button')).toBeTruthy();
  });

  it('has correct aria-label for light mode', () => {
    const { container } = render(<ThemeToggle />);
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('aria-label')).toBe('Switch to dark mode');
  });

  it('has correct aria-label for dark mode', () => {
    mockTheme = 'dark';
    const { container } = render(<ThemeToggle />);
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('aria-label')).toBe('Switch to light mode');
  });

  it('calls toggle when clicked', () => {
    const { container } = render(<ThemeToggle />);
    const btn = container.querySelector('button')!;
    fireEvent.click(btn);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('shows sun icon in light mode', () => {
    const { container } = render(<ThemeToggle />);
    const svg = container.querySelector('svg.text-amber-500');
    expect(svg).toBeTruthy();
  });

  it('shows moon icon in dark mode', () => {
    mockTheme = 'dark';
    const { container } = render(<ThemeToggle />);
    const svg = container.querySelector('svg.text-brand-600');
    expect(svg).toBeTruthy();
  });

  it('applies dark mode background class', () => {
    mockTheme = 'dark';
    const { container } = render(<ThemeToggle />);
    const btn = container.querySelector('button')!;
    expect(btn.classList.contains('bg-brand-600')).toBe(true);
  });

  it('applies light mode background class', () => {
    const { container } = render(<ThemeToggle />);
    const btn = container.querySelector('button')!;
    expect(btn.classList.contains('bg-gray-200')).toBe(true);
  });

  it('applies custom className', () => {
    const { container } = render(<ThemeToggle className="my-class" />);
    const btn = container.querySelector('button')!;
    expect(btn.classList.contains('my-class')).toBe(true);
  });
});
