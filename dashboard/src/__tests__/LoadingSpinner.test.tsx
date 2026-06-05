import { renderWithProviders } from './test-utils';
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoadingSpinner, { SkeletonCard, SkeletonTable } from '@/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<LoadingSpinner />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders with default size (md)', () => {
    const { container } = renderWithProviders(<LoadingSpinner />);
    const svg = container.querySelector('svg')!;
    expect(svg.classList.contains('w-8')).toBe(true);
    expect(svg.classList.contains('h-8')).toBe(true);
  });

  it('renders with sm size', () => {
    const { container } = renderWithProviders(<LoadingSpinner size="sm" />);
    const svg = container.querySelector('svg')!;
    expect(svg.classList.contains('w-4')).toBe(true);
    expect(svg.classList.contains('h-4')).toBe(true);
  });

  it('renders with lg size', () => {
    const { container } = renderWithProviders(<LoadingSpinner size="lg" />);
    const svg = container.querySelector('svg')!;
    expect(svg.classList.contains('w-12')).toBe(true);
    expect(svg.classList.contains('h-12')).toBe(true);
  });

  it('applies custom className', () => {
    const { container } = renderWithProviders(<LoadingSpinner className="my-custom" />);
    expect(container.firstChild).toBeTruthy();
    const wrapper = container.firstElementChild!;
    expect(wrapper.classList.contains('my-custom')).toBe(true);
  });

  it('has animate-spin class', () => {
    const { container } = renderWithProviders(<LoadingSpinner />);
    const svg = container.querySelector('svg')!;
    expect(svg.classList.contains('animate-spin')).toBe(true);
  });
});

describe('SkeletonCard', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SkeletonCard />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('has three skeleton bars', () => {
    const { container } = renderWithProviders(<SkeletonCard />);
    const bars = container.querySelectorAll('.bg-gray-200');
    expect(bars.length).toBe(3);
  });
});

describe('SkeletonTable', () => {
  it('renders with default rows and cols', () => {
    const { container } = renderWithProviders(<SkeletonTable />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders custom number of rows', () => {
    const { container } = renderWithProviders(<SkeletonTable rows={3} />);
    // Each row has a flex container
    const rows = container.querySelectorAll('.divide-y > div');
    expect(rows.length).toBe(3);
  });

  it('renders custom number of cols per row', () => {
    const { container } = renderWithProviders(<SkeletonTable rows={2} cols={3} />);
    const rows = container.querySelectorAll('.divide-y > div');
    // First row should have 3 columns
    const cols = rows[0]?.querySelectorAll('.bg-gray-200');
    expect(cols?.length).toBe(3);
  });
});
