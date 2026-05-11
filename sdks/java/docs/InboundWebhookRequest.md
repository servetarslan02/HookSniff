

# InboundWebhookRequest

Raw webhook payload received from an external provider (Stripe, GitHub, etc.)

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**provider** | **String** | Provider name (e.g. stripe, github, shopify) |  |
|**payload** | **Object** | Raw webhook payload body |  |
|**headers** | **Object** | HTTP headers from the incoming webhook request |  [optional] |



