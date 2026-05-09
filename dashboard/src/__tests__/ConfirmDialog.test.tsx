// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '@/components/ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders when open is true', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} />);
    expect(container.textContent).toContain('Delete Item');
    expect(container.textContent).toContain('Are you sure you want to delete this item?');
  });

  it('returns null when open is false', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders default button labels', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} />);
    expect(container.textContent).toContain('Confirm');
    expect(container.textContent).toContain('Cancel');
  });

  it('renders custom button labels', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} confirmLabel="Yes" cancelLabel="No" />);
    expect(container.textContent).toContain('Yes');
    expect(container.textContent).toContain('No');
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    const { container } = render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    // Find the confirm button (last button, or the one with brand/danger class)
    const buttons = container.querySelectorAll('button');
    const confirmBtn = buttons[buttons.length - 1]; // Confirm is the last button
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    const { container } = render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    const buttons = container.querySelectorAll('button');
    const cancelBtn = buttons[0]; // Cancel is the first button
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when backdrop clicked', () => {
    const onCancel = vi.fn();
    const { container } = render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/40');
    if (backdrop) fireEvent.click(backdrop);
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} loading={true} />);
    expect(container.textContent).toContain('Processing...');
    const buttons = container.querySelectorAll('button');
    expect(buttons[0].disabled).toBe(true);
  });

  it('applies danger variant styles', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} variant="danger" />);
    const buttons = container.querySelectorAll('button');
    const confirmBtn = buttons[buttons.length - 1];
    expect(confirmBtn.classList.contains('bg-red-600')).toBe(true);
  });

  it('applies default variant styles', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} variant="default" />);
    const buttons = container.querySelectorAll('button');
    const confirmBtn = buttons[buttons.length - 1];
    expect(confirmBtn.classList.contains('bg-brand-600')).toBe(true);
  });
});
