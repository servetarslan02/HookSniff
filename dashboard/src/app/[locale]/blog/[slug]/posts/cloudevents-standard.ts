import type { Post } from '../data';

export const post: Post = {
    title: 'Embracing the CloudEvents Standard',
    date: '2026-04-10',
    category: 'Standard',
    readTime: '4 min',
    tags: ['cloudevents', 'standard', 'architecture'],
    author: 'HookSniff Team',
    content: `CloudEvents is a CNCF specification for describing event data in a common way. HookSniff supports CloudEvents v1.0 natively.

### What is CloudEvents?

CloudEvents defines a standard envelope for event data with fields like specversion, type, source, id, and time.

### Why It Matters

Without a standard, every provider uses their own format. CloudEvents eliminates this by providing a universal envelope.

### Benefits

- **Interoperability** — Works with Knative, Argo Events, and more
- **Tooling** — Existing CloudEvents SDKs work out of the box
- **Consistency** — Predictable structure across all events
- **Future-proof** — CNCF-backed, widely adopted

### How to Enable It

Go to Settings and enable CloudEvents format. Mix formats per endpoint.`,
};
