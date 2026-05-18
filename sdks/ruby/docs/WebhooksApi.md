# OpenapiClient::WebhooksApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**webhooks_batch_post**](WebhooksApi.md#webhooks_batch_post) | **POST** /webhooks/batch | Send multiple webhooks in batch |
| [**webhooks_batch_replay_post**](WebhooksApi.md#webhooks_batch_replay_post) | **POST** /webhooks/batch/replay | Replay multiple deliveries by ID |
| [**webhooks_export_get**](WebhooksApi.md#webhooks_export_get) | **GET** /webhooks/export | Export deliveries as CSV |
| [**webhooks_get**](WebhooksApi.md#webhooks_get) | **GET** /webhooks | List webhook deliveries |
| [**webhooks_id_attempts_get**](WebhooksApi.md#webhooks_id_attempts_get) | **GET** /webhooks/{id}/attempts | Get delivery attempts |
| [**webhooks_id_get**](WebhooksApi.md#webhooks_id_get) | **GET** /webhooks/{id} | Get delivery by ID |
| [**webhooks_id_replay_post**](WebhooksApi.md#webhooks_id_replay_post) | **POST** /webhooks/{id}/replay | Replay a single delivery |
| [**webhooks_post**](WebhooksApi.md#webhooks_post) | **POST** /webhooks | Send a webhook |


## webhooks_batch_post

> <BatchResponse> webhooks_batch_post(batch_webhook_request)

Send multiple webhooks in batch

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::WebhooksApi.new
batch_webhook_request = OpenapiClient::BatchWebhookRequest.new({webhooks: [OpenapiClient::CreateWebhookRequest.new({endpoint_id: 'endpoint_id_example', data: 3.56})]}) # BatchWebhookRequest | 

begin
  # Send multiple webhooks in batch
  result = api_instance.webhooks_batch_post(batch_webhook_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_batch_post: #{e}"
end
```

#### Using the webhooks_batch_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<BatchResponse>, Integer, Hash)> webhooks_batch_post_with_http_info(batch_webhook_request)

```ruby
begin
  # Send multiple webhooks in batch
  data, status_code, headers = api_instance.webhooks_batch_post_with_http_info(batch_webhook_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <BatchResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_batch_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **batch_webhook_request** | [**BatchWebhookRequest**](BatchWebhookRequest.md) |  |  |

### Return type

[**BatchResponse**](BatchResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## webhooks_batch_replay_post

> webhooks_batch_replay_post(batch_replay_request)

Replay multiple deliveries by ID

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::WebhooksApi.new
batch_replay_request = OpenapiClient::BatchReplayRequest.new({ids: ['ids_example']}) # BatchReplayRequest | 

begin
  # Replay multiple deliveries by ID
  api_instance.webhooks_batch_replay_post(batch_replay_request)
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_batch_replay_post: #{e}"
end
```

#### Using the webhooks_batch_replay_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> webhooks_batch_replay_post_with_http_info(batch_replay_request)

```ruby
begin
  # Replay multiple deliveries by ID
  data, status_code, headers = api_instance.webhooks_batch_replay_post_with_http_info(batch_replay_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_batch_replay_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **batch_replay_request** | [**BatchReplayRequest**](BatchReplayRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## webhooks_export_get

> String webhooks_export_get(opts)

Export deliveries as CSV

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::WebhooksApi.new
opts = {
  range: '24h' # String | 
}

begin
  # Export deliveries as CSV
  result = api_instance.webhooks_export_get(opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_export_get: #{e}"
end
```

#### Using the webhooks_export_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(String, Integer, Hash)> webhooks_export_get_with_http_info(opts)

```ruby
begin
  # Export deliveries as CSV
  data, status_code, headers = api_instance.webhooks_export_get_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => String
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_export_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **range** | **String** |  | [optional][default to &#39;7d&#39;] |

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/csv


## webhooks_get

> <DeliveryListResponse> webhooks_get(opts)

List webhook deliveries

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::WebhooksApi.new
opts = {
  page: 56, # Integer | 
  per_page: 56, # Integer | 
  status: 'pending', # String | 
  endpoint_id: '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
}

begin
  # List webhook deliveries
  result = api_instance.webhooks_get(opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_get: #{e}"
end
```

#### Using the webhooks_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<DeliveryListResponse>, Integer, Hash)> webhooks_get_with_http_info(opts)

```ruby
begin
  # List webhook deliveries
  data, status_code, headers = api_instance.webhooks_get_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <DeliveryListResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **page** | **Integer** |  | [optional][default to 1] |
| **per_page** | **Integer** |  | [optional][default to 20] |
| **status** | **String** |  | [optional] |
| **endpoint_id** | **String** |  | [optional] |

### Return type

[**DeliveryListResponse**](DeliveryListResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## webhooks_id_attempts_get

> <Array<DeliveryAttempt>> webhooks_id_attempts_get(id)

Get delivery attempts

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::WebhooksApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Get delivery attempts
  result = api_instance.webhooks_id_attempts_get(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_id_attempts_get: #{e}"
end
```

#### Using the webhooks_id_attempts_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<DeliveryAttempt>>, Integer, Hash)> webhooks_id_attempts_get_with_http_info(id)

```ruby
begin
  # Get delivery attempts
  data, status_code, headers = api_instance.webhooks_id_attempts_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<DeliveryAttempt>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_id_attempts_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**Array&lt;DeliveryAttempt&gt;**](DeliveryAttempt.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## webhooks_id_get

> <Delivery> webhooks_id_get(id)

Get delivery by ID

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::WebhooksApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Get delivery by ID
  result = api_instance.webhooks_id_get(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_id_get: #{e}"
end
```

#### Using the webhooks_id_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Delivery>, Integer, Hash)> webhooks_id_get_with_http_info(id)

```ruby
begin
  # Get delivery by ID
  data, status_code, headers = api_instance.webhooks_id_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Delivery>
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_id_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**Delivery**](Delivery.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## webhooks_id_replay_post

> <Delivery> webhooks_id_replay_post(id)

Replay a single delivery

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::WebhooksApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Replay a single delivery
  result = api_instance.webhooks_id_replay_post(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_id_replay_post: #{e}"
end
```

#### Using the webhooks_id_replay_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Delivery>, Integer, Hash)> webhooks_id_replay_post_with_http_info(id)

```ruby
begin
  # Replay a single delivery
  data, status_code, headers = api_instance.webhooks_id_replay_post_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Delivery>
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_id_replay_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**Delivery**](Delivery.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## webhooks_post

> <Delivery> webhooks_post(create_webhook_request)

Send a webhook

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::WebhooksApi.new
create_webhook_request = OpenapiClient::CreateWebhookRequest.new({endpoint_id: 'endpoint_id_example', data: 3.56}) # CreateWebhookRequest | 

begin
  # Send a webhook
  result = api_instance.webhooks_post(create_webhook_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_post: #{e}"
end
```

#### Using the webhooks_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Delivery>, Integer, Hash)> webhooks_post_with_http_info(create_webhook_request)

```ruby
begin
  # Send a webhook
  data, status_code, headers = api_instance.webhooks_post_with_http_info(create_webhook_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Delivery>
rescue OpenapiClient::ApiError => e
  puts "Error when calling WebhooksApi->webhooks_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **create_webhook_request** | [**CreateWebhookRequest**](CreateWebhookRequest.md) |  |  |

### Return type

[**Delivery**](Delivery.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

