// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';

const { StatusBadge } = await import('@/components/StatusBadge');

describe('StatusBadge-ultra', () => {
  afterEach(() => {
    cleanup();
  });
  // Test 1: Renders with status text
  it('renders status text', () => {
    const { getByText } = render(<StatusBadge status="delivered" />);
    expect(getByText('delivered')).toBeTruthy();
  });

  // Test 2: Renders delivered status with green styling
  it('renders delivered with green styling', () => {
    const { container } = render(<StatusBadge status="delivered" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('bg-emerald');
    expect(badge.className).toContain('text-emerald');
  });

  // Test 3: Renders failed status with red styling
  it('renders failed with red styling', () => {
    const { container } = render(<StatusBadge status="failed" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('bg-red');
    expect(badge.className).toContain('text-red');
  });

  // Test 4: Renders pending status with amber styling
  it('renders pending with amber styling', () => {
    const { container } = render(<StatusBadge status="pending" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('bg-amber');
    expect(badge.className).toContain('text-amber');
  });

  // Test 5: Renders active status with blue styling
  it('renders active with blue styling', () => {
    const { container } = render(<StatusBadge status="active" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('bg-blue');
    expect(badge.className).toContain('text-blue');
  });

  // Test 6: Renders inactive status with gray styling
  it('renders inactive with gray styling', () => {
    const { container } = render(<StatusBadge status="inactive" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('bg-gray');
  });

  // Test 7: Renders banned status with red styling
  it('renders banned with red styling', () => {
    const { container } = render(<StatusBadge status="banned" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('bg-red');
  });

  // Test 8: Renders warning status with amber styling
  it('renders warning with amber styling', () => {
    const { container } = render(<StatusBadge status="warning" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('bg-amber');
  });

  // Test 9: Renders success status with green styling
  it('renders success with green styling', () => {
    const { container } = render(<StatusBadge status="success" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('bg-emerald');
  });

  // Test 10: Renders error status with red styling
  it('renders error with red styling', () => {
    const { container } = render(<StatusBadge status="error" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('bg-red');
  });

  // Test 11: Renders paid status with green styling
  it('renders paid with green styling', () => {
    const { container } = render(<StatusBadge status="paid" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('bg-emerald');
  });

  // Test 12: Falls back to pending styling for unknown status
  it('falls back to pending styling for unknown status', () => {
    const { container, getByText } = render(<StatusBadge status="unknown_status" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('bg-amber');
    expect(getByText('unknown_status')).toBeTruthy();
  });

  // Test 13: Default size is md
  it('uses md size by default', () => {
    const { container } = render(<StatusBadge status="delivered" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('text-xs');
  });

  // Test 14: sm size applies correct classes
  it('applies sm size classes', () => {
    const { container } = render(<StatusBadge status="delivered" size="sm" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('text-xs');
    expect(badge.className).toContain('px-2');
    expect(badge.className).toContain('py-0.5');
  });

  // Test 15: lg size applies correct classes
  it('applies lg size classes', () => {
    const { container } = render(<StatusBadge status="delivered" size="lg" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('text-sm');
    expect(badge.className).toContain('px-3');
    expect(badge.className).toContain('py-1');
  });

  // Test 16: Applies custom className
  it('applies custom className', () => {
    const { container } = render(<StatusBadge status="delivered" className="my-custom" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('my-custom');
  });

  // Test 17: Has dot indicator
  it('has a colored dot indicator', () => {
    const { container } = render(<StatusBadge status="delivered" />);
    const dot = container.querySelector('.rounded-full');
    expect(dot).toBeTruthy();
  });

  // Test 18: Has ring styling
  it('has ring-3 styling', () => {
    const { container } = render(<StatusBadge status="delivered" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('ring-1');
    expect(badge.className).toContain('ring-inset');
  });

  // Test 19: Has rounded-full shape
  it('has rounded-full shape', () => {
    const { container } = render(<StatusBadge status="delivered" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('rounded-full');
  });

  // Test 20: Has inline-flex display
  it('has inline-flex display', () => {
    const { container } = render(<StatusBadge status="delivered" />);
    const badge = container.querySelector('span')!;
    expect(badge.className).toContain('inline-flex');
    expect(badge.className).toContain('items-center');
  });
});
