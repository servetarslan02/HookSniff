# Outbound IP Addresses

HookRelay workers send webhook deliveries from **static IP addresses**. If your infrastructure uses a firewall, WAF, or IP allowlist, you must whitelist these IPs to receive webhooks from HookRelay.

## Static IPs

| IP Address | Region | Status |
|---|---|---|
| `TBD` | EU (Frankfurt) | ⏳ Pending Oracle Cloud VM setup |

> ⚠️ **Placeholder** — IPs will be published once the Oracle Cloud production VM is provisioned.

## API Endpoint

You can programmatically fetch the current outbound IPs:

```bash
curl https://api.hooksniff.is-a.dev/v1/outbound-ips
```

Response:

```json
{
  "ips": ["203.0.113.10", "203.0.113.11"],
  "updated_at": "2026-05-07T00:00:00Z"
}
```

## How to Whitelist

### Firewall Rules

Add the IPs above to your inbound firewall rules for the ports your webhook receiver listens on (typically `443`/HTTPS).

### WAF (Cloudflare, AWS WAF, etc.)

Create an IP access rule or custom WAF rule to allow traffic from HookRelay's outbound IPs.

### Cloud Provider Security Groups

- **AWS**: Add inbound rules to your EC2 security group
- **GCP**: Add VPC firewall rules
- **Azure**: Add NSG inbound security rules

## How to Verify

To confirm that a webhook request came from HookRelay's infrastructure:

1. **Check the source IP** — Inspect the `X-Forwarded-For` or remote address of incoming requests from HookRelay.
2. **Verify the HMAC signature** — Every webhook includes a `Webhook-Signature` header. Validate it using your endpoint's signing secret (see [Signature Verification](#signature-verification)).
3. **Call the API** — Query `GET /v1/outbound-ips` to get the current list and compare against incoming traffic.

### Signature Verification (Recommended)

IP whitelisting is a defense-in-depth measure. **Always verify the HMAC signature** on every webhook to ensure authenticity:

```bash
# The signature header format:
# Webhook-Signature: v1,<base64-hmac-sha256>

# Verify with your endpoint's secret:
echo -n "<timestamp>.<body>" | openssl dgst -sha256 -hmac "<your-signing-secret>" -binary | base64
```

## IP Changes

Outbound IPs **rarely change**. If they do (e.g., infrastructure migration), we will:

1. Update this documentation and the API response
2. Send email notifications to all active customers **at least 30 days** in advance
3. Publish the new IPs alongside the old ones during a transition period

Subscribe to [status.hooksniff.is-a.dev](https://status.hooksniff.is-a.dev) for infrastructure updates.

## Support

Questions about IP whitelisting? Contact support@hooksniff.is-a.dev.
