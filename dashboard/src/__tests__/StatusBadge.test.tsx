// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/StatusBadge';

describe('StatusBadge', () => {
  it('renders with status text', () => {
    render(<StatusBadge status="delivered" />);
    expect(screen.getByText('delivered')).toBeTruthy();
  });

  it('renders delivered status with correct classes', () => {
    const { container } = render(<StatusBadge status="delivered" />);
    const badge = container.querySelector('span')!;
    expect(badge.classList.contains('bg-emerald-50')).toBe(true);
    expect(badge.classList.contains('text-emerald-700')).toBe(true);
  });

  it('renders failed status with red colors', () => {
    const { container } = render(<StatusBadge status="failed" />);
    const badge = container.querySelector('span')!;
    expect(badge.classList.contains('bg-red-50')).toBe(true);
  });

  it('renders pending status with amber colors', () => {
    const { container } = render(<StatusBadge status="pending" />);
    const badge = container.querySelector('span')!;
    expect(badge.classList.contains('bg-amber-50')).toBe(true);
  });

  it('renders active status with blue colors', () => {
    const { container } = render(<StatusBadge status="active" />);
    const badge = container.querySelector('span')!;
    expect(badge.classList.contains('bg-blue-50')).toBe(true);
  });

  it('falls back to pending style for unknown status', () => {
    const { container } = render(<StatusBadge status="unknown_status" />);
    const badge = container.querySelector('span')!;
    expect(badge.classList.contains('bg-amber-50')).toBe(true);
  });

  it('renders with default size (md)', () => {
    const { container } = render(<StatusBadge status="active" />);
    const badge = container.querySelector('span')!;
    expect(badge.classList.contains('text-xs')).toBe(true);
  });

  it('renders with sm size', () => {
    const { container } = render(<StatusBadge status="active" size="sm" />);
    const badge = container.querySelector('span')!;
    expect(badge.classList.contains('text-xs')).toBe(true);
  });

  it('renders with lg size', () => {
    const { container } = render(<StatusBadge status="active" size="lg" />);
    const badge = container.querySelector('span')!;
    expect(badge.classList.contains('text-sm')).toBe(true);
  });

  it('applies custom className', () => {
    const { container } = render(<StatusBadge status="active" className="extra" />);
    const badge = container.querySelector('span')!;
    expect(badge.classList.contains('extra')).toBe(true);
  });

  it('renders success status with emerald colors', () => {
    const { container } = render(<StatusBadge status="success" />);
    const badge = container.querySelector('span')!;
    expect(badge.classList.contains('bg-emerald-50')).toBe(true);
  });

  it('renders error status with red colors', () => {
    const { container } = render(<StatusBadge status="error" />);
    const badge = container.querySelector('span')!;
    expect(badge.classList.contains('bg-red-50')).toBe(true);
  });
});
