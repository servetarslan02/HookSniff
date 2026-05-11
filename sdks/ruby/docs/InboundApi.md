# OpenapiClient::InboundApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**inbound_provider_endpoint_id_post**](InboundApi.md#inbound_provider_endpoint_id_post) | **POST** /inbound/{provider}/{endpoint_id} | Receive inbound webhook for a specific endpoint |
| [**inbound_provider_post**](InboundApi.md#inbound_provider_post) | **POST** /inbound/{provider} | Receive inbound webhook from a provider |


## inbound_provider_endpoint_id_post

> inbound_provider_endpoint_id_post(provider, endpoint_id, body)

Receive inbound webhook for a specific endpoint

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::InboundApi.new
provider = 'provider_example' # String | 
endpoint_id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
body = { ... } # Object | 

begin
  # Receive inbound webhook for a specific endpoint
  api_instance.inbound_provider_endpoint_id_post(provider, endpoint_id, body)
rescue OpenapiClient::ApiError => e
  puts "Error when calling InboundApi->inbound_provider_endpoint_id_post: #{e}"
end
```

#### Using the inbound_provider_endpoint_id_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> inbound_provider_endpoint_id_post_with_http_info(provider, endpoint_id, body)

```ruby
begin
  # Receive inbound webhook for a specific endpoint
  data, status_code, headers = api_instance.inbound_provider_endpoint_id_post_with_http_info(provider, endpoint_id, body)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling InboundApi->inbound_provider_endpoint_id_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **provider** | **String** |  |  |
| **endpoint_id** | **String** |  |  |
| **body** | **Object** |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## inbound_provider_post

> inbound_provider_post(provider, body)

Receive inbound webhook from a provider

Accepts webhooks from external providers (Stripe, GitHub, etc.) and routes them to the customer's endpoints. 

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::InboundApi.new
provider = 'provider_example' # String | 
body = { ... } # Object | 

begin
  # Receive inbound webhook from a provider
  api_instance.inbound_provider_post(provider, body)
rescue OpenapiClient::ApiError => e
  puts "Error when calling InboundApi->inbound_provider_post: #{e}"
end
```

#### Using the inbound_provider_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> inbound_provider_post_with_http_info(provider, body)

```ruby
begin
  # Receive inbound webhook from a provider
  data, status_code, headers = api_instance.inbound_provider_post_with_http_info(provider, body)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling InboundApi->inbound_provider_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **provider** | **String** |  |  |
| **body** | **Object** |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

