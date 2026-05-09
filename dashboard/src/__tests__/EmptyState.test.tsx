// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import EmptyState from '@/components/EmptyState';

describe('EmptyState', () => {
  it('renders with title', () => {
    const { container } = render(<EmptyState title="No data" />);
    expect(container.textContent).toContain('No data');
  });

  it('renders default icon (📭)', () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(container.textContent).toContain('📭');
  });

  it('renders custom icon', () => {
    const { container } = render(<EmptyState title="Empty" icon="🔍" />);
    expect(container.textContent).toContain('🔍');
  });

  it('renders description when provided', () => {
    const { container } = render(<EmptyState title="Empty" description="Nothing to see here" />);
    expect(container.textContent).toContain('Nothing to see here');
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="Empty" />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });

  it('renders action button when provided', () => {
    const onClick = vi.fn();
    const { container } = render(<EmptyState title="Empty" action={{ label: 'Create', onClick }} />);
    expect(container.textContent).toContain('Create');
  });

  it('calls action.onClick when button is clicked', () => {
    const onClick = vi.fn();
    const { container } = render(<EmptyState title="Empty" action={{ label: 'Create', onClick }} />);
    const button = container.querySelector('button');
    expect(button).toBeTruthy();
    fireEvent.click(button!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when not provided', () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(container.querySelector('button')).toBeNull();
  });
});
