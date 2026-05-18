# OpenapiClient::DeliveryDetailsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**webhooks_id_attempts_attempt_id_get**](DeliveryDetailsApi.md#webhooks_id_attempts_attempt_id_get) | **GET** /webhooks/{id}/attempts/{attempt_id} | Get specific attempt detail |
| [**webhooks_id_details_get**](DeliveryDetailsApi.md#webhooks_id_details_get) | **GET** /webhooks/{id}/details | Get detailed delivery info |


## webhooks_id_attempts_attempt_id_get

> webhooks_id_attempts_attempt_id_get(id, attempt_id)

Get specific attempt detail

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::DeliveryDetailsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
attempt_id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Get specific attempt detail
  api_instance.webhooks_id_attempts_attempt_id_get(id, attempt_id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling DeliveryDetailsApi->webhooks_id_attempts_attempt_id_get: #{e}"
end
```

#### Using the webhooks_id_attempts_attempt_id_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> webhooks_id_attempts_attempt_id_get_with_http_info(id, attempt_id)

```ruby
begin
  # Get specific attempt detail
  data, status_code, headers = api_instance.webhooks_id_attempts_attempt_id_get_with_http_info(id, attempt_id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling DeliveryDetailsApi->webhooks_id_attempts_attempt_id_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **attempt_id** | **String** |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## webhooks_id_details_get

> webhooks_id_details_get(id)

Get detailed delivery info

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::DeliveryDetailsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Get detailed delivery info
  api_instance.webhooks_id_details_get(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling DeliveryDetailsApi->webhooks_id_details_get: #{e}"
end
```

#### Using the webhooks_id_details_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> webhooks_id_details_get_with_http_info(id)

```ruby
begin
  # Get detailed delivery info
  data, status_code, headers = api_instance.webhooks_id_details_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling DeliveryDetailsApi->webhooks_id_details_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

