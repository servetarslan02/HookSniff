# DATA PROCESSING AGREEMENT (DPA)

> Version: 1.0
> Effective Date: [DATE]
> Last Updated: 2026-05-09

This Data Processing Agreement ("DPA") forms part of the Terms of Service between HookSniff ("Processor") and the customer ("Controller") using the HookSniff webhook delivery service.

---

## 1. Definitions

| Term | Meaning |
|------|---------|
| **Controller** | The customer who sends webhook data through HookSniff |
| **Processor** | HookSniff, which processes webhook data on behalf of the Controller |
| **Personal Data** | Any data that can identify a natural person (name, email, IP, etc.) |
| **Processing** | Any operation on data (receive, store, transmit, delete) |
| **Sub-processor** | Third-party services used by HookSniff to deliver the service |
| **Data Subject** | The natural person whose data is processed |

---

## 2. Scope and Purpose

### 2.1 What this DPA covers
HookSniff processes webhook payload data on behalf of the Controller solely for the purpose of delivering webhooks to configured endpoints.

### 2.2 What HookSniff does with data
- Receives webhook payloads via API
- Delivers payloads to Controller's configured endpoints
- Retries failed deliveries according to the plan's retry policy
- Stores delivery logs for the plan's retention period
- Deletes data automatically after retention period expires

### 2.3 What HookSniff does NOT do
- Does not inspect, analyze, or mine webhook payload content
- Does not sell, rent, or share webhook data with third parties
- Does not use webhook data for advertising or profiling
- Does not access webhook data for purposes other than delivery

---

## 3. Types of Data Processed

| Data Category | Examples | Purpose |
|---------------|----------|---------|
| Webhook Payloads | JSON data sent by Controller | Delivery to endpoints |
| Endpoint URLs | Controller's webhook destinations | Delivery routing |
| Delivery Logs | Timestamps, response codes, latency | Monitoring and debugging |
| API Keys | Hashed authentication keys | Authentication |
| Account Data | Email, name, company | Account management |

---

## 4. Data Subjects

Data processed may include information about:
- Controller's customers
- Controller's employees
- Controller's end users
- Any individuals whose data is included in webhook payloads

---

## 5. Sub-processors

### 5.1 Current Sub-processors

| Service | Purpose | Location | DPA Available |
|---------|---------|----------|---------------|
| Google Cloud Platform | API hosting, compute | EU (europe-west1) | ✅ |
| Neon | PostgreSQL database | EU (eu-central-1) | ✅ |
| Upstash | Redis cache | Global | ✅ |
| Vercel | Dashboard hosting | Global | ✅ |
| Cloudflare | CDN, storage (R2) | Global | ✅ |
| Stripe | Payment processing | US | ✅ |
| Polar.sh | Payment processing (MoR) | EU | ✅ |
| iyzico | Payment processing (Turkey) | Turkey | ✅ |
| Grafana Cloud | Monitoring | EU | ✅ |

### 5.2 Sub-processor Changes
- HookSniff will notify Controller 30 days before adding new sub-processors
- Controller may object to new sub-processors in writing
- If objection cannot be resolved, Controller may terminate the service

---

## 6. Data Location and Transfers

### 6.1 Primary Location
Data is primarily processed and stored in:
- **EU (europe-west1)** — Google Cloud Platform
- **EU (eu-central-1)** — Neon PostgreSQL

### 6.2 International Transfers
Some sub-processors may process data outside the EU. HookSniff ensures:
- Standard Contractual Clauses (SCCs) are in place where required
- Adequate safeguards as per GDPR Chapter V
- Data minimization — only necessary data is transferred

---

## 7. Security Measures

HookSniff implements the following technical and organizational measures:

### 7.1 Technical Measures
| Measure | Implementation |
|---------|---------------|
| Encryption in transit | TLS 1.2+ for all API and webhook traffic |
| Encryption at rest | Database encryption (Neon, GCP) |
| API key security | SHA-256 hashing, never stored in plaintext |
| Webhook signatures | HMAC-SHA256 (Standard Webhooks compliant) |
| Password security | Argon2 hashing |
| Access control | Role-based authentication |
| SSRF protection | URL validation and allowlisting |
| Rate limiting | Per-IP and per-account limits |

### 7.2 Organizational Measures
| Measure | Implementation |
|---------|---------------|
| Access control | Principle of least privilege |
| Logging | Audit logs for administrative actions |
| Incident response | Defined procedures for security incidents |
| Regular updates | Dependencies updated regularly |
| Security audits | Periodic code and infrastructure reviews |

---

## 8. Data Retention and Deletion

| Data Type | Retention Period | Deletion Method |
|-----------|-----------------|-----------------|
| Webhook payloads | Per plan (7/30/90 days) | Automatic deletion |
| Delivery logs | Per plan (7/30/90 days) | Automatic deletion |
| Account data | While account active + 30 days | On account deletion |
| Payment records | As required by law | Manual review |
| API request logs | 30 days | Automatic deletion |

After the retention period, data is permanently and irreversibly deleted.

---

## 9. Data Subject Rights

HookSniff assists the Controller in fulfilling data subject rights:

| Right | How HookSniff assists |
|-------|----------------------|
| **Access** | API endpoint: `GET /v1/auth/export` |
| **Deletion** | API endpoint: `DELETE /v1/auth/account` |
| **Rectification** | API endpoint: `PUT /v1/auth/profile` |
| **Portability** | JSON export via API |
| **Objection** | Account deletion available |

---

## 10. Data Breach Notification

In case of a personal data breach:

1. HookSniff will notify Controller **without undue delay** (within 72 hours)
2. Notification will include:
   - Nature of the breach
   - Categories and approximate number of data subjects affected
   - Likely consequences
   - Measures taken or proposed to address the breach
3. HookSniff will cooperate with Controller to mitigate the breach

---

## 11. Controller Obligations

The Controller agrees to:
- Only send data through HookSniff that it has the right to process
- Configure endpoints securely (HTTPS recommended)
- Keep API keys confidential
- Comply with applicable data protection laws
- Notify HookSniff of any data subject requests within 5 business days

---

## 12. Audit Rights

- Controller may request information about HookSniff's security practices
- HookSniff will provide available compliance documentation
- On-site audits require 30 days' notice and reasonable scheduling

---

## 13. Term and Termination

- This DPA is effective as long as the Controller uses HookSniff's services
- Upon termination, HookSniff will delete all Controller data within 30 days
- Sections 7 (Security), 10 (Breach), and 12 (Audit) survive termination

---

## 14. Governing Law

This DPA is governed by the laws of Turkey. For GDPR purposes, HookSniff acknowledges its obligations as a data processor under Article 28 of the GDPR.

---

## 15. Signatures

**Controller:**

Name: _________________________
Title: _________________________
Date: _________________________

**Processor (HookSniff):**

Name: Servet Arslan
Title: Owner
Date: _________________________

---

## Appendix A — Technical and Organizational Measures (TOMs)

Detailed security measures are documented in HookSniff's Security Policy:
- GitHub: [SECURITY.md](https://github.com/servetarslan02/HookSniff/blob/main/SECURITY.md)
- Dashboard: Available upon request

## Appendix B — Sub-processor List

Current sub-processors are listed in Section 5.1.
Updates are communicated 30 days in advance.
