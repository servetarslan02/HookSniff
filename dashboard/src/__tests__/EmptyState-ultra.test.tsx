// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';

const { default: EmptyState } = await import('@/components/EmptyState');

describe('EmptyState-ultra', () => {
  afterEach(() => {
    cleanup();
  });
  // Test 1: Renders with title
  it('renders title', () => {
    const { getByText } = render(<EmptyState title="No items" />);
    expect(getByText('No items')).toBeTruthy();
  });

  // Test 2: Renders default icon
  it('renders default icon', () => {
    const { getByText } = render(<EmptyState title="Empty" />);
    expect(getByText('📭')).toBeTruthy();
  });

  // Test 3: Renders custom icon
  it('renders custom icon', () => {
    const { getByText } = render(<EmptyState title="Empty" icon="🔍" />);
    expect(getByText('🔍')).toBeTruthy();
  });

  // Test 4: Renders description when provided
  it('renders description when provided', () => {
    const { getByText } = render(
      <EmptyState title="No results" description="Try adjusting your filters" />
    );
    expect(getByText('Try adjusting your filters')).toBeTruthy();
  });

  // Test 5: Does not render description when not provided
  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="No results" />);
    expect(container.querySelector('p')).toBeNull();
  });

  // Test 6: Renders action button when provided
  it('renders action button when provided', () => {
    const onClick = vi.fn();
    const { getByText } = render(
      <EmptyState title="No items" action={{ label: 'Create item', onClick }} />
    );
    expect(getByText('Create item')).toBeTruthy();
  });

  // Test 7: Calls action onClick when button clicked
  it('calls action onClick when button clicked', () => {
    const onClick = vi.fn();
    const { getByText } = render(
      <EmptyState title="No items" action={{ label: 'Create', onClick }} />
    );
    fireEvent.click(getByText('Create'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // Test 8: Does not render button when no action
  it('does not render button when no action provided', () => {
    const { container } = render(<EmptyState title="No items" />);
    expect(container.querySelector('button')).toBeNull();
  });

  // Test 9: Renders with all props
  it('renders with all props', () => {
    const onClick = vi.fn();
    const { getByText } = render(
      <EmptyState
        icon="🚀"
        title="Get started"
        description="Create your first endpoint"
        action={{ label: 'Create Endpoint', onClick }}
      />
    );
    expect(getByText('🚀')).toBeTruthy();
    expect(getByText('Get started')).toBeTruthy();
    expect(getByText('Create your first endpoint')).toBeTruthy();
    expect(getByText('Create Endpoint')).toBeTruthy();
  });

  // Test 10: Has glass-card styling
  it('has glass-card container class', () => {
    const { container } = render(<EmptyState title="Test" />);
    expect(container.firstChild).toBeTruthy();
    expect((container.firstChild as HTMLElement).className).toContain('glass-card');
  });
});
