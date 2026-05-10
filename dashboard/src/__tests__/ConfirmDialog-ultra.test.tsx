// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';

const { default: ConfirmDialog } = await import('@/components/ConfirmDialog');

describe('ConfirmDialog-ultra', () => {
  const defaultProps = {
    open: true,
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // Test 1: Renders when open
  it('renders when open is true', () => {
    const { getByText } = render(<ConfirmDialog {...defaultProps} />);
    expect(getByText('Delete Item')).toBeTruthy();
    expect(getByText('Are you sure you want to delete this item?')).toBeTruthy();
  });

  // Test 2: Does not render when closed
  it('returns null when open is false', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(container.innerHTML).toBe('');
  });

  // Test 3: Shows default button labels
  it('shows default Confirm and Cancel labels', () => {
    const { getByText } = render(<ConfirmDialog {...defaultProps} />);
    expect(getByText('Confirm')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  // Test 4: Shows custom button labels
  it('shows custom button labels', () => {
    const { getByText } = render(
      <ConfirmDialog {...defaultProps} confirmLabel="Yes, delete" cancelLabel="No, keep" />
    );
    expect(getByText('Yes, delete')).toBeTruthy();
    expect(getByText('No, keep')).toBeTruthy();
  });

  // Test 5: Calls onConfirm when confirm button clicked
  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    const { getByText } = render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  // Test 6: Calls onCancel when cancel button clicked
  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    const { getByText } = render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // Test 7: Calls onCancel on Escape key
  it('calls onCancel when Escape is pressed', () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // Test 8: Shows loading state
  it('shows "Processing..." when loading', () => {
    const { getByText } = render(<ConfirmDialog {...defaultProps} loading={true} />);
    expect(getByText('Processing...')).toBeTruthy();
  });

  // Test 9: Disables buttons when loading
  it('disables both buttons when loading', () => {
    const { getByText } = render(<ConfirmDialog {...defaultProps} loading={true} />);
    expect(getByText('Cancel').closest('button')!.disabled).toBe(true);
    expect(getByText('Processing...').closest('button')!.disabled).toBe(true);
  });

  // Test 10: Shows danger variant styling
  it('applies danger variant class to confirm button', () => {
    const { getByText } = render(<ConfirmDialog {...defaultProps} variant="danger" />);
    const confirmBtn = getByText('Confirm').closest('button')!;
    expect(confirmBtn.className).toContain('bg-red-600');
  });

  // Test 11: Shows default variant styling
  it('applies default variant class to confirm button', () => {
    const { getByText } = render(<ConfirmDialog {...defaultProps} variant="default" />);
    const confirmBtn = getByText('Confirm').closest('button')!;
    expect(confirmBtn.className).toContain('bg-brand-600');
  });

  // Test 12: Has dialog role
  it('has dialog role attribute', () => {
    const { getByRole } = render(<ConfirmDialog {...defaultProps} />);
    expect(getByRole('dialog')).toBeTruthy();
  });

  // Test 13: Has aria-modal attribute
  it('has aria-modal="true"', () => {
    const { getByRole } = render(<ConfirmDialog {...defaultProps} />);
    expect(getByRole('dialog').getAttribute('aria-modal')).toBe('true');
  });

  // Test 14: Has backdrop that calls onCancel
  it('calls onCancel when backdrop is clicked', () => {
    const onCancel = vi.fn();
    const { container } = render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    // The backdrop is the first div with bg-black/40
    const backdrop = container.querySelector('[aria-hidden="true"]');
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop!);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // Test 15: Prevents body scroll when open
  it('sets body overflow to hidden when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  // Test 16: Restores body scroll when closed
  it('restores body overflow when dialog closes', () => {
    const { rerender } = render(<ConfirmDialog {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<ConfirmDialog {...defaultProps} open={false} />);
    expect(document.body.style.overflow).toBe('');
  });
});
