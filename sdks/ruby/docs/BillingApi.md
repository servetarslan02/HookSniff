# OpenapiClient::BillingApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**billing_invoices_get**](BillingApi.md#billing_invoices_get) | **GET** /billing/invoices | List invoices |
| [**billing_portal_post**](BillingApi.md#billing_portal_post) | **POST** /billing/portal | Open customer billing portal |
| [**billing_subscription_get**](BillingApi.md#billing_subscription_get) | **GET** /billing/subscription | Get current subscription |
| [**billing_upgrade_post**](BillingApi.md#billing_upgrade_post) | **POST** /billing/upgrade | Upgrade plan |
| [**billing_usage_get**](BillingApi.md#billing_usage_get) | **GET** /billing/usage | Get current usage |
| [**billing_webhook_iyzico_post**](BillingApi.md#billing_webhook_iyzico_post) | **POST** /billing/webhook/iyzico | iyzico webhook receiver |
| [**billing_webhook_polar_post**](BillingApi.md#billing_webhook_polar_post) | **POST** /billing/webhook/polar | Polar.sh webhook receiver |
| [**billing_webhook_post**](BillingApi.md#billing_webhook_post) | **POST** /billing/webhook | Stripe webhook receiver |


## billing_invoices_get

> <Array<InvoiceResponse>> billing_invoices_get

List invoices

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::BillingApi.new

begin
  # List invoices
  result = api_instance.billing_invoices_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_invoices_get: #{e}"
end
```

#### Using the billing_invoices_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<InvoiceResponse>>, Integer, Hash)> billing_invoices_get_with_http_info

```ruby
begin
  # List invoices
  data, status_code, headers = api_instance.billing_invoices_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<InvoiceResponse>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_invoices_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;InvoiceResponse&gt;**](InvoiceResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## billing_portal_post

> <BillingPortalPost200Response> billing_portal_post

Open customer billing portal

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::BillingApi.new

begin
  # Open customer billing portal
  result = api_instance.billing_portal_post
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_portal_post: #{e}"
end
```

#### Using the billing_portal_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<BillingPortalPost200Response>, Integer, Hash)> billing_portal_post_with_http_info

```ruby
begin
  # Open customer billing portal
  data, status_code, headers = api_instance.billing_portal_post_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <BillingPortalPost200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_portal_post_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**BillingPortalPost200Response**](BillingPortalPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## billing_subscription_get

> <SubscriptionResponse> billing_subscription_get

Get current subscription

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::BillingApi.new

begin
  # Get current subscription
  result = api_instance.billing_subscription_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_subscription_get: #{e}"
end
```

#### Using the billing_subscription_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SubscriptionResponse>, Integer, Hash)> billing_subscription_get_with_http_info

```ruby
begin
  # Get current subscription
  data, status_code, headers = api_instance.billing_subscription_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SubscriptionResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_subscription_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**SubscriptionResponse**](SubscriptionResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## billing_upgrade_post

> <UpgradeResponse> billing_upgrade_post(upgrade_request)

Upgrade plan

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::BillingApi.new
upgrade_request = OpenapiClient::UpgradeRequest.new({plan: 'pro'}) # UpgradeRequest | 

begin
  # Upgrade plan
  result = api_instance.billing_upgrade_post(upgrade_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_upgrade_post: #{e}"
end
```

#### Using the billing_upgrade_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<UpgradeResponse>, Integer, Hash)> billing_upgrade_post_with_http_info(upgrade_request)

```ruby
begin
  # Upgrade plan
  data, status_code, headers = api_instance.billing_upgrade_post_with_http_info(upgrade_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <UpgradeResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_upgrade_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **upgrade_request** | [**UpgradeRequest**](UpgradeRequest.md) |  |  |

### Return type

[**UpgradeResponse**](UpgradeResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## billing_usage_get

> <UsageResponse> billing_usage_get

Get current usage

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::BillingApi.new

begin
  # Get current usage
  result = api_instance.billing_usage_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_usage_get: #{e}"
end
```

#### Using the billing_usage_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<UsageResponse>, Integer, Hash)> billing_usage_get_with_http_info

```ruby
begin
  # Get current usage
  data, status_code, headers = api_instance.billing_usage_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <UsageResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_usage_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**UsageResponse**](UsageResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## billing_webhook_iyzico_post

> billing_webhook_iyzico_post(body)

iyzico webhook receiver

### Examples

```ruby
require 'time'
require 'openapi_client'

api_instance = OpenapiClient::BillingApi.new
body = { ... } # Object | 

begin
  # iyzico webhook receiver
  api_instance.billing_webhook_iyzico_post(body)
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_webhook_iyzico_post: #{e}"
end
```

#### Using the billing_webhook_iyzico_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> billing_webhook_iyzico_post_with_http_info(body)

```ruby
begin
  # iyzico webhook receiver
  data, status_code, headers = api_instance.billing_webhook_iyzico_post_with_http_info(body)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_webhook_iyzico_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **body** | **Object** |  |  |

### Return type

nil (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## billing_webhook_polar_post

> billing_webhook_polar_post(body)

Polar.sh webhook receiver

### Examples

```ruby
require 'time'
require 'openapi_client'

api_instance = OpenapiClient::BillingApi.new
body = { ... } # Object | 

begin
  # Polar.sh webhook receiver
  api_instance.billing_webhook_polar_post(body)
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_webhook_polar_post: #{e}"
end
```

#### Using the billing_webhook_polar_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> billing_webhook_polar_post_with_http_info(body)

```ruby
begin
  # Polar.sh webhook receiver
  data, status_code, headers = api_instance.billing_webhook_polar_post_with_http_info(body)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_webhook_polar_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **body** | **Object** |  |  |

### Return type

nil (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## billing_webhook_post

> billing_webhook_post(body)

Stripe webhook receiver

### Examples

```ruby
require 'time'
require 'openapi_client'

api_instance = OpenapiClient::BillingApi.new
body = { ... } # Object | 

begin
  # Stripe webhook receiver
  api_instance.billing_webhook_post(body)
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_webhook_post: #{e}"
end
```

#### Using the billing_webhook_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> billing_webhook_post_with_http_info(body)

```ruby
begin
  # Stripe webhook receiver
  data, status_code, headers = api_instance.billing_webhook_post_with_http_info(body)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling BillingApi->billing_webhook_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **body** | **Object** |  |  |

### Return type

nil (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

