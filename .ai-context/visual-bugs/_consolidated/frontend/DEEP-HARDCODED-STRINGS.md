# Deep Hardcoded English Strings Audit

> **Scan Date:** 2026-05-10
> **Scope:** `src/app/[locale]/` (all subdirs) + `src/components/`
> **Excluded:** `t('...')` / `useTranslations()` wrapped strings (only hardcoded found)

---

## SAYFALAR (Pages)

### error.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 20 | "Something went wrong" | error heading |
| 22 | "An unexpected error occurred. Please try again." | error description |

### not-found.tsx
*(No hardcoded English strings found — likely uses translation)*

### loading.tsx
*(No hardcoded English strings found)*

### page.tsx (Home)
| Satır | Metin | Context |
|-------|-------|---------|
| 272 | "HookSniff" | brand name in nav |
| 288 | "Toggle navigation" | aria-label |
| 433 | "HookSniff" | brand name in footer |

### about/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 16 | "About" | breadcrumb |
| 29 | "About HookSniff" | page title |
| 37 | "Our Mission" | section heading |
| 65 | "Our Story" | section heading |

### auth/callback/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 24 | "OAuth login was cancelled." | error message |
| 38 | "Authentication failed. Please try logging in again." | error message |
| 42 | "Network error. Please try again." | error message |
| 51 | "Login Failed" | error heading |
| 69 | "Redirecting to dashboard" | redirect message |

### blog/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 278 | "Blog" | breadcrumb |
| 287 | "Blog" | page title |
| 295 | "Subscribe to our newsletter" | newsletter heading |
| 330 | "Search posts by title or content..." | search placeholder |
| 338 | "Clear search" | aria-label |
| 442 | "What Users Say" | section heading |

### blog/[slug]/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 431 | "Production webhook receiver" | meta description |
| 1694 | "Blog" | breadcrumb |
| 1849 | "Twitter" | share link |
| 1850 | "LinkedIn" | share link |
| 1851 | "Hacker News" | share link |
| 1857 | "Related Posts" | section heading |
| 1901 | "On This Page" | TOC heading |

### build-vs-buy/BuildVsBuyContent.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 119 | "Build vs Buy" | breadcrumb |
| 141 | "Engineers to deploy HookSniff" | stat label |
| 145 | "Days" | stat label |
| 146 | "Time to production" | stat label |
| 151 | "HookSniff Pro" | stat label |
| 241 | "When Building Still Makes Sense" | section heading |
| 265 | "Frequently Asked Questions" | section heading |
| 296 | "Compare alternatives" | button text |

### changelog/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 70 | "Changelog" | breadcrumb |
| 79 | "Changelog" | page title |
| 105 | "Subscribe" | button text |
| 114 | "All types" | filter button |
| 129 | "All areas" | filter button |
| 147 | "Navigate" | sidebar heading |

### changelog/[slug]/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 65 | "Changelog" | breadcrumb |
| 81 | "Latest" | badge text |

### compare/CompareContent.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 227 | "Why is HookSniff SOC 2 \"Ready\" but not \"Type 2\"?" + answer | FAQ item |
| 272 | "Compare" | breadcrumb |
| 304 | "HookSniff in Action" | section heading |
| 307 | "HookSniff Compare — side-by-side webhook service comparison" | alt text |
| 309 | "Compare Page" | caption |
| 314 | "HookSniff Scorecard — feature comparison across 6 categories" | alt text |
| 316 | "Scorecard" | caption |
| 321 | "HookSniff Playground — test webhooks in real-time" | alt text |
| 323 | "Webhook Playground" | caption |
| 328 | "HookSniff Build vs Buy — 12 dimension webhook infrastructure comparison" | alt text |
| 330 | "Build vs Buy" | caption |
| 339 | "Scorecard" | section heading |
| 344 | "Category" | table header |
| 362 | "Total" | table cell |
| 375 | "Trusted by developers who switched from building their own webhooks" | subtitle |
| 391 | "Detailed Comparison" | section heading |
| 453 | "Frequently Asked Questions" | section heading |
| 476 | "Deep Dive Comparisons" | section heading |
| 500 | "View pricing" | button text |

### contact/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 40 | "Contact" | breadcrumb |
| 47 | "Contact Us" | page title |
| 58 | "Email" | label |
| 69 | "Location" | label |
| 79 | "Response Time" | label |
| 86 | "Send us a message" | form heading |
| 103 | "Name" | form label |
| 109 | "Your name" | placeholder |
| 115 | "Email" | form label |
| 128 | "Subject" | form label |
| 135 | "Select a topic" | option |
| 136 | "General question" | option |
| 137 | "Technical support" | option |
| 138 | "Billing & payments" | option |
| 139 | "Enterprise inquiry" | option |
| 140 | "Bug report" | option |
| 141 | "Feature request" | option |
| 145 | "Message" | form label |
| 151 | "How can we help?" | placeholder |
| 96 | "Failed to send. Please email us directly at support@hooksniff.vercel.app" | error message |

### customers/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 155 | "Customers" | breadcrumb |
| 184 | "Built on trusted infrastructure" | subtitle |
| 202 | "Featured stories" | section heading |
| 230 | "All customer stories" | section heading |
| 280 | "Join thousands of developers" | CTA heading |
| 284 | "Talk to us" | button text |

### customers/[slug]/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 224 | "Story not found" | error heading |
| 238 | "Customers" | breadcrumb |
| 270 | "The problem" | section heading |
| 283 | "The solution" | section heading |
| 296 | "Results" | section heading |
| 303 | "Before" | stat label |
| 308 | "After" | stat label |
| 319 | "Tech stack" | section heading |
| 333 | "More stories" | button text |

### faq/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 63 | "FAQ" | breadcrumb |

### get-started/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 46 | "My production endpoint" | code example |
| 74 | "My production endpoint" | code example |
| 98 | "My production endpoint" | code example |
| 185 | "HookSniff" | brand name |

### login/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 68 | "HookSniff" | brand name |
| 160 | "Or continue with" | divider text |

### newsletter/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 98 | "Newsletter" | breadcrumb |
| 108 | "The Webhook Digest" | page title |
| 188 | "Recent Issues" | section heading |
| 246 | "Subscribers" | stat label |
| 251 | "Open rate" | stat label |
| 256 | "Issues sent" | stat label |
| 263 | "What subscribers say" | section heading |
| 301 | "Servet Arslan" | testimonial name |
| 321 | "Frequently Asked Questions" | section heading |
| 347 | "Your privacy matters" | heading |
| 351 | "Privacy Policy" | link text |

### playground/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 78 | "Failed to generate token" | error message |
| 82 | "Network error — check your connection" | error message |
| 260 | "Playground" | breadcrumb |
| 269 | "Webhook Playground" | page title |
| 369 | "Send a test webhook" | section heading |
| 372 | "Event type" | form label |
| 376 | "Quick samples" | form label |
| 406 | "Clear all" | button text |
| 413 | "No requests yet" | empty state |
| 414 | "Send a webhook to your URL above" | empty state hint |
| 443 | "Request Detail" | section heading |
| 447 | "Select a request to inspect" | empty state |
| 462 | "Headers" | section heading |
| 470 | "Body" | section heading |
| 489 | "IP Address" | label |
| 702 | "Playground API" | section heading |
| 708 | "No signup" | badge |
| 709 | "REST API" | badge |
| 711 | "Rate limited" | badge |
| 774 | "Query Parameters" | section heading |
| 837 | "Python" | section heading |
| 871 | "Feature" | table header |
| 872 | "Svix Play" | table header |
| 873 | "HookSniff" | table header |

### pricing/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 47 | "Svix" | comparison label |
| 52 | "Hookdeck" | comparison label |

### privacy/page.tsx
*(Entire page is hardcoded English legal content — ~30+ strings)*

### security/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 38 | "Security" | breadcrumb |
| 85 | "Architecture security" | section heading |
| 88 | "Data at rest" | subheading |
| 97 | "Data in transit" | subheading |
| 125 | "View source code" | button text |

### startups/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 14 | "Startups" | breadcrumb |
| 23 | "Build faster with HookSniff" | page title |
| 54 | "Apply for startup pricing" | CTA heading |

### status/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 253 | "No data" | empty state |
| 288 | "Today" | label |
| 313 | "Uptime" | stat label |
| 322 | "Latency" | stat label |
| 428 | "Upcoming" | section heading |
| 448 | "Past Maintenance" | section heading |
| 464 | "No scheduled maintenance" | empty state |
| 604 | "HookSniff" | brand name |
| 606 | "Status" | breadcrumb |
| 620 | "System Status" | page title |
| 642 | "Overall Uptime" | section heading |
| 662 | "Components" | section heading |
| 676 | "Incident History" | section heading |
| 682 | "Scheduled Maintenance" | section heading |
| 692 | "Docs" | link text |

### terms/page.tsx
*(Entire page is hardcoded English legal content — ~30+ strings)*

### use-cases/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 376 | "Use Cases" | breadcrumb |
| 453 | "Common events" | section heading |
| 468 | "Code example" | section heading |
| 506 | "Key metrics" | section heading |
| 533 | "All industries" | section heading |

### verify-email/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 57 | "HookSniff" | brand name |
| 86 | "Link Expired" | error heading |
| 104 | "Verification Failed" | error heading |

### what-is-a-webhook/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 26 | "The Simple Explanation" | section heading |
| 30 | "Polling = You keep calling the pizza place asking..." | explanation |
| 31 | "Webhook = The pizza place calls YOU when your pizza is ready." | explanation |
| 36 | "How Webhooks Work" | section heading |
| 46 | "Webhook vs API vs Polling" | section heading |
| 49 | "Aspect" / "Polling" / "Webhook" | table headers |
| 51-55 | "Direction" / "Timing" / "Efficiency" / "Latency" / "Complexity" + values | table rows |
| 62 | "Common Use Cases" | section heading |
| 81 | "Webhook Security" | section heading |
| 84-87 | "HMAC signatures" / "HTTPS only" / "IP whitelisting" / "Timestamp validation" | list items |
| 92 | "Getting Started with Webhooks" | section heading |

### webhooks/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 17 | "Webhooks" | breadcrumb |
| 25 | "Webhooks" | page title |

### webhooks/guides/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 54 | "Webhooks" | breadcrumb |
| 56 | "Guides" | breadcrumb |

### webhooks/glossary/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 54 | "Webhooks" | breadcrumb |
| 56 | "Glossary" | breadcrumb |

### providers/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 23 | "Providers" | breadcrumb |
| 31 | "Webhook Provider Guides" | page title |

### providers/stripe/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 17 | "Providers" | breadcrumb |
| 19 | "Stripe" | breadcrumb |
| 29 | "Stripe Integration" | badge |
| 31 | "Stripe Webhooks Guide" | page title |
| 44 | "Create a HookSniff endpoint" | step heading |
| 51 | "Configure Stripe" | step heading |
| 58 | "Select events" | step heading |
| 79 | "Event" | table header |
| 80 | "When It Fires" | table header |
| 133 | "Start receiving Stripe webhooks" | CTA heading |

### providers/github/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 17 | "Providers" | breadcrumb |
| 19 | "GitHub" | breadcrumb |
| 29 | "GitHub Integration" | badge |
| 31 | "GitHub Webhooks Guide" | page title |
| 43 | "Create a HookSniff endpoint" | step heading |
| 50 | "Configure GitHub" | step heading |
| 57 | "Select events" | step heading |
| 70 | "Event" | table header |
| 71 | "When It Fires" | table header |
| 98 | "Start receiving GitHub webhooks" | CTA heading |

### providers/shopify/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 17 | "Providers" | breadcrumb |
| 19 | "Shopify" | breadcrumb |
| 29 | "Shopify Integration" | badge |
| 31 | "Shopify Webhooks Guide" | page title |
| 42 | "Create a HookSniff endpoint" | step heading |
| 46 | "Configure Shopify" | step heading |
| 50 | "Verify HMAC" | step heading |
| 60 | "Topic" | table header |
| 61 | "When It Fires" | table header |
| 87 | "Start receiving Shopify webhooks" | CTA heading |

### alternatives/hookdeck/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 29 | "Alternatives" | breadcrumb |
| 31 | "Hookdeck" | breadcrumb |
| 38 | "HookSniff vs Hookdeck" | page title |
| 44 | "Feature" | table header |
| 46 | "Hookdeck" | table header |

### alternatives/svix/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 29 | "Alternatives" | breadcrumb |
| 31 | "Svix" | breadcrumb |
| 38 | "HookSniff vs Svix" | page title |
| 44 | "Feature" | table header |
| 46 | "Svix" | table header |
| 59 | "HookSniff Pro is $49/mo vs Svix Professional at $490/mo..." | comparison text |

### alternatives/convoy/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 21 | "HookSniff vs Convoy" | page title |
| 27 | "Feature" | table header |
| 29 | "Convoy" | table header |

### alternatives/hook0/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 27 | "Feature" | table header |

### alternatives/webhook-relay/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 21 | "HookSniff vs Webhook Relay" | page title |
| 27 | "Feature" | table header |
| 29 | "Webhook Relay" | table header |

### alternatives/hookdeck-alternatives/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 17 | "Alternatives" | breadcrumb |
| 19 | "Hookdeck" | breadcrumb |
| 40 | "Service" | table header |
| 41 | "Price" | table header |
| 42 | "Open Source" | table header |
| 44 | "SDKs" | table header |
| 45 | "Routing" | table header |

### alternatives/svix-alternatives/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 60 | "Alternatives" | breadcrumb |
| 62 | "Svix" | breadcrumb |
| 84 | "Service" | table header |
| 85 | "Price" | table header |
| 86 | "SDKs" | table header |
| 87 | "Open Source" | table header |
| 90 | "SLA" | table header |
| 124 | "Recommended" | badge |

### alternatives/convoy-alternatives/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 17 | "Alternatives" | breadcrumb |
| 19 | "Convoy" | breadcrumb |
| 35 | "Service" | table header |
| 36 | "Price" | table header |
| 37 | "SDKs" | table header |
| 38 | "Managed Cloud" | table header |
| 39 | "Open Source" | table header |
| 40 | "Portal" | table header |

---

## Dashboard Pages

### dashboard/layout.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 84 | "HookSniff" | sidebar brand |
| 85 | "Webhook Dashboard" | sidebar subtitle |
| 133 | "Open sidebar" | aria-label |

### dashboard/page.tsx
*(Uses translations — no hardcoded strings found)*

### dashboard/alerts/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 117 | "Name" | form label |
| 127 | "Condition" | form label |
| 139 | "Threshold" | form label |
| 148 | "Channels" | form label |
| 191 | "No alert rules yet. Create one to get notified about webhook failures." | empty state |

### dashboard/analytics/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 90 | "Success Rate" | stat label |
| 102 | "Total Delivered" | stat label |
| 113 | "Total Failed" | stat label |
| 170 | "Successful" | chart legend |
| 171 | "Failed" | chart legend |

### dashboard/api-importer/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 81 | "Failed to parse OpenAPI spec" | toast error |
| 84 | "Failed to fetch: ..." | toast error |
| 95 | "Failed to parse. Make sure it's valid JSON." | toast error |
| 208 | "OpenAPI Spec URL" | form label |
| 228 | "Paste OpenAPI JSON" | form label |
| 317 | "Supported Formats" | section heading |

### dashboard/api-keys/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 133 | "Dismiss error" | aria-label |

### dashboard/audit-log/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 92 | "All Actions" | filter option |
| 93 | "Authentication" | filter option |
| 94 | "Endpoints" | filter option |
| 95 | "API Keys" | filter option |
| 96 | "Webhooks" | filter option |
| 97 | "Team" | filter option |
| 98 | "Settings" | filter option |
| 99 | "Billing" | filter option |
| 112 | "No activity yet" | empty state |
| 123 | "Time" | table header |
| 124 | "Action" | table header |
| 125 | "Actor" | table header |
| 126 | "Resource" | table header |
| 127 | "Details" | table header |

### dashboard/billing/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 378 | "No invoices yet." | empty state |

### dashboard/custom-domain/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 34 | "Failed to add domain" | toast error |
| 74 | "Add Domain" | section heading |
| 96 | "DNS Records" | section heading |
| 104 | "Type" | table header |
| 105 | "Name" | table header |
| 106 | "Value" | table header |
| 107 | "Copy" | table header |
| 153 | "How it works" | section heading |

### dashboard/deliveries/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 43 | "Failed to load deliveries" | error message |
| 129 | "Event" | table header |
| 130 | "Status" | table header |
| 131 | "Attempts" | table header |
| 132 | "Response" | table header |
| 133 | "Time" | table header |
| 212 | "Close details" | aria-label |
| 215-221 | "ID" / "Event" / "Endpoint" / "Status" / "Attempts" / "HTTP Status" / "Created" | DetailRow labels |

### dashboard/deliveries/[id]/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 40 | "Failed to load delivery" | error message |
| 71 | "Failed to copy" | toast error |
| 134 | "Failed to load delivery" | error heading |
| 164 | "Back to deliveries" | title attr |
| 171 | "Delivery Details" | page heading |
| 189 | "Status" | label |
| 193 | "Event" | label |
| 199 | "Attempts" | label |
| 203 | "Response" | label |
| 222 | "Delivery ID" | DetailRow label |
| 223 | "Endpoint ID" | DetailRow label |
| 225 | "Endpoint URL" | DetailRow label |
| 227 | "Event Type" | DetailRow label |
| 228 | "Status" | DetailRow label |
| 229 | "Attempt Count" | DetailRow label |
| 231 | "Last Response" | DetailRow label |
| 233 | "Created" | DetailRow label |
| 235 | "Updated" | DetailRow label |
| 239 | "Error" | label |
| 286 | "Copy headers" | title attr |
| 330 | "Copy payload" | title attr |
| 362 | "No attempt data available" | empty state |
| 363 | "Attempts will appear here once the delivery is processed" | hint text |
| 420 | "Error Message" | label |
| 445 | "Response Body" | label |
| 459 | "Copy response body" | title attr |
| 494 | "Replay Webhook" | dialog title |
| 531 | "Copy" | title attr |

### dashboard/endpoints/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 48 | "Failed to create endpoint" | error message |
| 65 | "Failed to delete" | toast error |
| 142 | "URL" | form label |
| 153 | "Description" | form label |
| 184 | "No endpoints yet. Create one to start receiving webhooks." | empty state |
| 239 | "Settings" | title attr |

### dashboard/endpoints/[id]/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 62 | "Failed to load endpoint" | error message |
| 84 | "Failed to update" | error message |
| 133 | "Failed to send" | error message |
| 138 | "Failed to send test" | error message |
| 191 | "Endpoint Settings" | page heading |
| 200 | "Retry Policy" | section heading |
| 316 | "Signing Secret" | section heading |
| 325 | "Current Secret" | label |
| 351 | "Rate Limits" | section heading |
| 356 | "API Requests" | label |
| 363 | "Avg Response" | label |
| 370 | "Failure Streak" | label |

### dashboard/health/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 102 | "No endpoints yet. Create one to start monitoring health." | empty state |

### dashboard/inbound/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 73 | "How it works" | section heading |
| 75 | "External Service" | flow label |
| 79 | "Verify Signature" | flow label |
| 81 | "Your Endpoint" | flow label |
| 88 | "Add Inbound Provider" | dialog heading |
| 103 | "Webhook Secret" | form label |
| 110 | "Route to Endpoint" | form label |
| 113 | "Select endpoint..." | option placeholder |
| 119 | "Save" | button text |
| 120 | "Cancel" | button text |
| 129 | "Your Inbound URLs" | section heading |
| 137 | "Copy" | button text |
| 146 | "Active Configs" | section heading |

### dashboard/logs/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 40 | "Failed to load logs" | error message |
| 326-336 | "Event" / "Endpoint" / "Status" / "Attempts" / "Created" | DetailRow labels |

### dashboard/notifications/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 50 | "Failed to load notifications" | toast error |
| 66 | "Failed to mark as read" | toast error |
| 77 | "Failed to mark all as read" | toast error |
| 89 | "Failed to delete notification" | toast error |

### dashboard/playground/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 246 | "Request History" | section heading |

### dashboard/portal/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 43 | "Failed to load portal data" | error message |
| 67 | "Profile" | section heading |
| 70 | "Email" | label |
| 74 | "Plan" | label |
| 78 | "Member since" | label |
| 82 | "Webhook limit" | label |
| 91 | "Usage" | section heading |
| 94 | "Webhooks used" | label |
| 98 | "Endpoints" | label |
| 102 | "API calls today" | label |

### dashboard/portal-customize/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 76 | "Failed to save portal config" | toast error |
| 140 | "Company Name" | form label |
| 145 | "My Company" | placeholder |
| 150 | "Logo URL" | form label |
| 160 | "Primary Color" | form label |
| 177 | "Font Family" | form label |
| 197 | "Dark Mode" | toggle label |
| 198 | "Enable dark mode by default" | toggle description |
| 212 | "Show Events" | toggle label |
| 213 | "Allow users to view event types" | toggle description |
| 227 | "Show Deliveries" | toggle label |
| 228 | "Allow users to view delivery history" | toggle description |
| 282 | "All events allowed" | status text |
| 303 | "Logo" | alt text |
| 316 | "Webhook Endpoints" | preview label |
| 323 | "Event Subscriptions" | preview label |
| 336 | "Recent Deliveries" | preview label |

### dashboard/rate-limiting/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 91 | "Total Endpoints" | stat label |
| 103 | "Throttled Requests" | stat label |
| 121-126 | "Endpoint" / "RPS" / "RPM" / "Burst" / "Queue" / "Throttled" | table headers |
| 160 | "Rate Limiting" | section heading |
| 168 | "Auto Retry" | toggle label |
| 169 | "Exponential backoff" | toggle description |
| 174 | "Custom limits" | toggle description |
| 178 | "Alerts" | toggle label |
| 179 | "Throttle notifications" | toggle description |
| 187 | "How Rate Limiting Works" | section heading |

### dashboard/retry-policy/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 106 | "Failed to save retry policy" | toast error |
| 167 | "Retry Settings" | section heading |
| 170 | "Max Attempts" | form label |
| 182 | "Backoff Strategy" | form label |
| 249 | "Dead Letter Queue" | section heading |
| 252 | "Enable DLQ" | toggle label |
| 253 | "Move permanently failed deliveries to DLQ" | toggle description |
| 281 | "Retry on Status Codes" | section heading |
| 347 | "Endpoint Settings" | link text |

### dashboard/routing/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 62 | "No endpoints configured yet." | empty state |

### dashboard/schemas/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 37 | "No schemas registered yet" | empty state |

### dashboard/search/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 135-139 | "Event" / "Status" / "Endpoint" / "Attempts" / "Time" | table headers |

### dashboard/settings/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 384 | "DELETE" | confirmation placeholder |

### dashboard/signature-verifier/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 39 | "Failed to compute signature" | toast error |
| 113 | "Algorithm" | section heading |
| 133 | "Verify Signature" | section heading |
| 146 | "Webhook Secret" | form label |
| 223 | "How Webhook Signatures Work" | section heading |

### dashboard/sso/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 63 | "Failed to save SSO config" | toast error |
| 91 | "Provider" | section heading |
| 121 | "SAML Configuration" | section heading |
| 124 | "Metadata URL" | form label |
| 134 | "Entity ID" | form label |
| 144 | "SSO URL" | form label |
| 170 | "OpenID Connect Configuration" | section heading |
| 173 | "Issuer URL" | form label |
| 183 | "Client ID" | form label |
| 193 | "Client Secret" | form label |
| 211 | "Enable SSO" | toggle label |
| 232 | "SSO is available on the Business plan. Upgrade now to enable SSO for your organization." | info message |

### dashboard/team/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 36 | "Failed to load teams" | toast error |
| 48 | "Failed to load members" | toast error |
| 71 | "Failed to create team" | toast error |
| 88 | "Failed to invite member" | toast error |
| 101 | "Failed to remove member" | toast error |
| 112 | "Failed to update role" | toast error |
| 195 | "No members yet. Invite someone!" | empty state |
| 250 | "Team Name" | form label |
| 297 | "Email" | form label |
| 307 | "Role" | form label |

### dashboard/templates/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 37 | "No templates available" | empty state |

### dashboard/transforms/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 57 | "Failed to create rule" | toast error |
| 66 | "Failed to delete" | toast error |
| 83 | "Select Endpoint" | form label |
| 86 | "Choose an endpoint..." | option placeholder |
| 94 | "New Transform Rule" | section heading |
| 107 | "Map from" | form label |
| 111 | "Map to" | form label |
| 119 | "Enrich key" | form label |
| 123 | "Enrich value" | form label |
| 126 | "Create" | button text |
| 133 | "Select an endpoint to manage transforms" | empty state |
| 146 | "Filter" | badge |
| 155 | "Map" | badge |
| 161 | "Enrich" | badge |
| 166 | "Delete transform" | aria-label |

### dashboard/webhook-builder/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 108 | "Failed to send" | toast error |
| 131 | "Templates" | section heading |
| 151 | "Event Type" | section heading |
| 164 | "Payload Fields" | section heading |
| 206 | "Send To" | section heading |
| 228 | "Preview" | section heading |
| 237 | "// Click \"Refresh\" to preview the payload" | code placeholder |

### dashboard/webhooks/new/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 74 | "Endpoint" | form label |
| 87 | "Event Type" | form label |

---

## Admin Pages

### admin/layout.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 35 | "Access Denied" | error heading |
| 70 | "Admin Panel" | sidebar brand |
| 71 | "HookSniff Management" | sidebar subtitle |
| 120 | "Open sidebar" | aria-label |

### admin/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 67 | "Admin Overview" | page title |

### admin/revenue/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 62 | "Revenue Dashboard" | page title |

### admin/settings/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 62 | "Failed to save settings" | toast error |
| 118 | "Default Plan" | form label |
| 124 | "Free" | option |
| 125 | "Pro" | option |
| 139 | "Max Endpoints" | form label |
| 180 | "Max Endpoints" | form label |
| 224 | "Max Retry Attempts" | form label |

### admin/users/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 148 | "Email" | table header |
| 149 | "Name" | table header |
| 150 | "Plan" | table header |
| 151 | "Status" | table header |
| 152 | "Created" | table header |
| 153 | "Actions" | table header |

### admin/users/[id]/page.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 30 | "Failed to load user details" | toast error |
| 78 | "User Not Found" | error heading |
| 103 | "User Detail" | breadcrumb |
| 110 | "User Info" | section heading |
| 117 | "Email" | label |
| 121 | "Name" | label |
| 125 | "Status" | label |
| 131 | "Created" | label |
| 141 | "Management" | section heading |
| 193 | "Total Deliveries" | stat label |
| 199 | "Success Rate" | stat label |
| 205 | "Endpoints" | stat label |
| 217 | "Endpoints" | section heading |
| 239 | "No endpoints" | empty state |
| 247 | "Recent Deliveries" | section heading |
| 255-258 | "Event" / "Status" / "Attempts" / "Time" | table headers |

---

## COMPONENTS

### AuthGuard.tsx
*(No hardcoded English strings found)*

### CodeBlock.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 20 | "✓ Copied!" / "Copy" | button text |

### ConfirmDialog.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 22 | "Confirm" | default confirm button label |
| 23 | "Cancel" | default cancel button label |

### EmailVerificationBanner.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 65 | "Sending..." / "Resend" | button text |

### EmptyState.tsx
*(No hardcoded English strings found — accepts props)*

### ErrorBoundary.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 35 | "Something went wrong" | error heading |

### Footer.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 55 | "Product" | column heading |
| 58 | "Get Started" | link text |
| 73 | "Compare" | column heading |
| 85 | "Resources" | column heading |
| 105 | "Company" | column heading |
| 116 | "GitHub" | link text |
| 126 | "HookSniff" | brand name |

### LanguageSwitcher.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 47 | "Switch language" | aria-label |

### LoadingSpinner.tsx
*(No hardcoded English strings found)*

### NotificationCenter.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 80 | "Notifications" | aria-label |
| 100 | "Notifications" | heading |

### Onboarding.tsx
*(No hardcoded English strings found)*

### OnboardingWizard.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 42 | "Payments" | category label |
| 47 | "Other" | category label |
| 53-62 | "Python" / "Go" / "Rust" / "Java" / "Ruby" / "Kotlin" / "Elixir" | SDK labels |
| 173 | "Failed to create endpoint" | error message |
| 275 | "Choose your SDK" | step heading |
| 297 | "Install Command" | label |
| 302 | "✓ Copied!" / "Copy" | button text |
| 315 | "Create your first endpoint" | step heading |
| 341 | "My production webhook endpoint" | placeholder |
| 347 | "No real URL yet? Use the Playground to get a temporary test URL..." | hint text |
| 357 | "Send a test webhook" | step heading |
| 362 | "Test Command" | label |
| 367 | "✓ Copied!" / "Copy" | button text |
| 415 | "Endpoints" | quick link label |
| 419 | "Deliveries" | quick link label |
| 423 | "Playground" | quick link label |
| 427 | "API Keys" | quick link label |
| 525 | "Create account" | checklist label |
| 527 | "Create first endpoint" | checklist label |
| 528 | "Send first webhook" | checklist label |
| 529 | "Check deliveries" | checklist label |
| 567 | "Setup Progress" | heading |

### SdkTabs.tsx
| Satır | Metin | Context |
|-------|-------|---------|
| 41 | "✓ Copied!" / "Copy" | button text |

### StatusBadge.tsx
*(No hardcoded English strings found)*

### ThemeProvider.tsx
*(No hardcoded English strings found)*

### ThemeToggle.tsx
*(No hardcoded English strings found)*

### Toast.tsx
*(No hardcoded English strings found — renders dynamic content)*

### tremor/ChartCard.tsx
*(No hardcoded English strings found)*

### tremor/StatCard.tsx
*(No hardcoded English strings found)*

### tremor/StatusBadge.tsx
*(No hardcoded English strings found)*

---

## LIB
*(No lib directory files found in the scanned paths)*

---

## Summary Statistics

| Category | Files Scanned | Files with Hardcoded Strings | Total Hardcoded Strings |
|----------|--------------|------------------------------|------------------------|
| SAYFALAR (Pages) | ~95 | ~70 | ~600+ |
| Dashboard Pages | ~35 | ~33 | ~250+ |
| Admin Pages | ~6 | ~6 | ~40+ |
| COMPONENTS | ~20 | ~10 | ~30+ |
| **TOTAL** | **~156** | **~119** | **~920+** |

## Priority Files (Most Hardcoded Strings)

1. **dashboard/deliveries/[id]/page.tsx** — ~30+ hardcoded strings (DetailRow labels, error messages, titles)
2. **playground/page.tsx** — ~25+ hardcoded strings (labels, headings, badges, empty states)
3. **dashboard/portal-customize/page.tsx** — ~18+ hardcoded strings (form labels, toggle descriptions)
4. **dashboard/rate-limiting/page.tsx** — ~15+ hardcoded strings (table headers, labels)
5. **compare/CompareContent.tsx** — ~20+ hardcoded strings (headings, captions, alt texts)
6. **dashboard/team/page.tsx** — ~12+ hardcoded strings (toast errors, form labels)
7. **dashboard/audit-log/page.tsx** — ~12+ hardcoded strings (filter options, table headers)
8. **OnboardingWizard.tsx** — ~20+ hardcoded strings (SDK labels, step headings, checklists)
9. **what-is-a-webhook/page.tsx** — ~15+ hardcoded strings (explanations, table content)
10. **dashboard/endpoints/[id]/page.tsx** — ~12+ hardcoded strings (section headings, labels)
