import { API_BASE as _API_BASE } from '@/lib/api';

export const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
export const API_BASE = _API_BASE;

export const ENDPOINT_PATHS: Record<string, string> = {
  'List Endpoints': '/endpoints',
  'List Deliveries': '/webhooks',
  'Get Stats': '/stats',
  'List Templates': '/templates',
  'Health Check': '/health',
  'List API Keys': '/api-keys',
};

// ─── AI Payload Templates ───
export const AI_PAYLOAD_TEMPLATES: Record<string, () => object> = {
  'order.created': () => ({
    event: 'order.created',
    data: {
      order_id: `ord_${Date.now().toString(36)}`,
      customer: {
        id: `cus_${Math.random().toString(36).slice(2, 10)}`,
        email: 'jane.doe@example.com',
        name: 'Jane Doe',
      },
      items: [
        { sku: 'WIDGET-001', name: 'Premium Widget', quantity: 2, unit_price: 29.99 },
        { sku: 'GADGET-042', name: 'Super Gadget', quantity: 1, unit_price: 149.99 },
      ],
      total: 209.97,
      currency: 'USD',
      shipping_method: 'express',
      created_at: new Date().toISOString(),
    },
  }),
  'order.completed': () => ({
    event: 'order.completed',
    data: {
      order_id: `ord_${Date.now().toString(36)}`,
      status: 'completed',
      completed_at: new Date().toISOString(),
      total_charged: 209.97,
      payment_method: 'visa_ending_4242',
    },
  }),
  'payment.failed': () => ({
    event: 'payment.failed',
    data: {
      payment_id: `pay_${Math.random().toString(36).slice(2, 10)}`,
      order_id: `ord_${Date.now().toString(36)}`,
      amount: 99.99,
      currency: 'USD',
      error: {
        code: 'card_declined',
        message: 'Your card was declined. Please try a different payment method.',
        decline_code: 'insufficient_funds',
      },
      customer_id: `cus_${Math.random().toString(36).slice(2, 10)}`,
      attempted_at: new Date().toISOString(),
    },
  }),
  'payment.succeeded': () => ({
    event: 'payment.succeeded',
    data: {
      payment_id: `pay_${Math.random().toString(36).slice(2, 10)}`,
      amount: 149.99,
      currency: 'USD',
      method: 'card',
      card_brand: 'visa',
      card_last4: '4242',
      receipt_url: 'https://pay.stripe.com/receipts/...',
      paid_at: new Date().toISOString(),
    },
  }),
  'user.registered': () => ({
    event: 'user.registered',
    data: {
      user_id: `usr_${Math.random().toString(36).slice(2, 10)}`,
      email: 'new.user@example.com',
      name: 'Alex Smith',
      plan: 'pro',
      registered_at: new Date().toISOString(),
      source: 'organic',
    },
  }),
  'user.updated': () => ({
    event: 'user.updated',
    data: {
      user_id: `usr_${Math.random().toString(36).slice(2, 10)}`,
      changes: {
        plan: { old: 'developer', new: 'pro' },
        email: { old: 'old@example.com', new: 'new@example.com' },
      },
      updated_at: new Date().toISOString(),
    },
  }),
  'invoice.created': () => ({
    event: 'invoice.created',
    data: {
      invoice_id: `inv_${Math.random().toString(36).slice(2, 10)}`,
      customer_id: `cus_${Math.random().toString(36).slice(2, 10)}`,
      amount_due: 49.99,
      currency: 'USD',
      period_start: new Date(Date.now() - 30 * 86400000).toISOString(),
      period_end: new Date().toISOString(),
      status: 'open',
    },
  }),
};
