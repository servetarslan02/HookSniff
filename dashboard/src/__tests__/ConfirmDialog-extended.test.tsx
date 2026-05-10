// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '@/components/ConfirmDialog';

describe('ConfirmDialog - Extended', () => {
  const defaultProps = {
    open: true,
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // --- Closed state ---
  describe('closed state (open=false)', () => {
    it('renders nothing when open is false', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} open={false} />);
      expect(container.innerHTML).toBe('');
    });

    it('does not render title or message when closed', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} open={false} />);
      expect(container.textContent).not.toContain('Delete Item');
      expect(container.textContent).not.toContain('Are you sure');
    });
  });

  // --- Props rendering ---
  describe('props rendering', () => {
    it('renders the title', () => {
      render(<ConfirmDialog {...defaultProps} title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeTruthy();
    });

    it('renders the message', () => {
      render(<ConfirmDialog {...defaultProps} message="Custom message body" />);
      expect(screen.getByText('Custom message body')).toBeTruthy();
    });

    it('renders default confirmLabel "Confirm"', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);
      const buttons = container.querySelectorAll('button');
      expect(buttons[buttons.length - 1].textContent).toBe('Confirm');
    });

    it('renders custom confirmLabel', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} confirmLabel="Delete Everything" />);
      const buttons = container.querySelectorAll('button');
      expect(buttons[buttons.length - 1].textContent).toBe('Delete Everything');
    });

    it('renders default cancelLabel "Cancel"', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);
      const buttons = container.querySelectorAll('button');
      expect(buttons[0].textContent).toBe('Cancel');
    });

    it('renders custom cancelLabel', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} cancelLabel="Go Back" />);
      const buttons = container.querySelectorAll('button');
      expect(buttons[0].textContent).toBe('Go Back');
    });
  });

  // --- Variants ---
  describe('variants', () => {
    it('applies danger variant class to confirm button', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} variant="danger" />);
      const buttons = container.querySelectorAll('button');
      const confirmBtn = buttons[buttons.length - 1];
      expect(confirmBtn.classList.contains('bg-red-600')).toBe(true);
    });

    it('applies default variant class to confirm button', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} variant="default" />);
      const buttons = container.querySelectorAll('button');
      const confirmBtn = buttons[buttons.length - 1];
      expect(confirmBtn.classList.contains('bg-brand-600')).toBe(true);
    });

    it('uses default variant when variant is omitted', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);
      const buttons = container.querySelectorAll('button');
      const confirmBtn = buttons[buttons.length - 1];
      expect(confirmBtn.classList.contains('bg-brand-600')).toBe(true);
    });
  });

  // --- Button interactions ---
  describe('button interactions', () => {
    it('calls onConfirm when confirm button is clicked', () => {
      const onConfirm = vi.fn();
      const { container } = render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
      const buttons = container.querySelectorAll('button');
      fireEvent.click(buttons[buttons.length - 1]);
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      const { container } = render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
      const buttons = container.querySelectorAll('button');
      fireEvent.click(buttons[0]);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  // --- Click outside (backdrop) ---
  describe('click outside to cancel', () => {
    it('calls onCancel when backdrop is clicked', () => {
      const onCancel = vi.fn();
      const { container } = render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
      const backdrop = container.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeTruthy();
      fireEvent.click(backdrop!);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('backdrop has aria-hidden="true"', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);
      const backdrop = container.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeTruthy();
    });
  });

  // --- Keyboard handling (Escape) ---
  describe('keyboard handling', () => {
    it('calls onCancel when Escape is pressed', () => {
      const onCancel = vi.fn();
      render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel when other keys are pressed', () => {
      const onCancel = vi.fn();
      render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'a' });
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  // --- Accessibility ---
  describe('accessibility', () => {
    it('has role="dialog"', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    });

    it('has aria-modal="true"', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog?.getAttribute('aria-modal')).toBe('true');
    });

    it('has aria-labelledby pointing to title element', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);
      const dialog = container.querySelector('[role="dialog"]');
      const labelledBy = dialog?.getAttribute('aria-labelledby');
      expect(labelledBy).toBe('confirm-dialog-title');
      const titleEl = container.querySelector('[id="confirm-dialog-title"]');
      expect(titleEl).toBeTruthy();
      expect(titleEl?.textContent).toBe('Delete Item');
    });

    it('dialog element is focusable (tabIndex=-1)', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog?.getAttribute('tabindex')).toBe('-1');
    });
  });

  // --- Loading state ---
  describe('loading state', () => {
    it('shows "Processing..." text when loading', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} loading={true} />);
      expect(container.textContent).toContain('Processing...');
    });

    it('disables both buttons when loading', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} loading={true} />);
      const buttons = container.querySelectorAll('button');
      expect(buttons[0].disabled).toBe(true);
      expect(buttons[1].disabled).toBe(true);
    });

    it('adds opacity class to confirm button when loading', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} loading={true} />);
      const buttons = container.querySelectorAll('button');
      const confirmBtn = buttons[buttons.length - 1];
      expect(confirmBtn.classList.contains('opacity-60')).toBe(true);
    });
  });

  // --- Body scroll lock ---
  describe('body scroll lock', () => {
    it('sets body overflow to hidden when open', () => {
      render(<ConfirmDialog {...defaultProps} open={true} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body overflow when dialog closes', () => {
      const { rerender } = render(<ConfirmDialog {...defaultProps} open={true} />);
      expect(document.body.style.overflow).toBe('hidden');
      rerender(<ConfirmDialog {...defaultProps} open={false} />);
      expect(document.body.style.overflow).toBe('');
    });
  });

  // --- Focus trap (Tab key) ---
  describe('focus trap', () => {
    it('wraps focus from last to first element on Tab', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);
      const buttons = container.querySelectorAll('button');
      const lastBtn = buttons[buttons.length - 1];
      lastBtn.focus();
      expect(document.activeElement).toBe(lastBtn);
      fireEvent.keyDown(document, { key: 'Tab' });
      // Focus should wrap to the first focusable element
      expect(document.activeElement).toBe(buttons[0]);
    });

    it('wraps focus from first to last element on Shift+Tab', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);
      const buttons = container.querySelectorAll('button');
      const firstBtn = buttons[0];
      firstBtn.focus();
      expect(document.activeElement).toBe(firstBtn);
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      // Focus should wrap to the last focusable element
      expect(document.activeElement).toBe(buttons[buttons.length - 1]);
    });
  });

  // --- Focus management ---
  describe('focus management', () => {
    it('focuses the dialog element when opened', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);
      const dialog = container.querySelector('[role="dialog"]');
      expect(document.activeElement).toBe(dialog);
    });
  });
});
