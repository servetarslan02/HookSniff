# OpenapiClient::RateLimitsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**rate_limits_endpoint_id_delete**](RateLimitsApi.md#rate_limits_endpoint_id_delete) | **DELETE** /rate-limits/{endpoint_id} | Delete rate limit for endpoint |
| [**rate_limits_endpoint_id_get**](RateLimitsApi.md#rate_limits_endpoint_id_get) | **GET** /rate-limits/{endpoint_id} | Get rate limit for endpoint |
| [**rate_limits_endpoint_id_post**](RateLimitsApi.md#rate_limits_endpoint_id_post) | **POST** /rate-limits/{endpoint_id} | Set rate limit for endpoint |
| [**rate_limits_get**](RateLimitsApi.md#rate_limits_get) | **GET** /rate-limits | List rate limits |


## rate_limits_endpoint_id_delete

> rate_limits_endpoint_id_delete(endpoint_id)

Delete rate limit for endpoint

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::RateLimitsApi.new
endpoint_id = 'endpoint_id_example' # String | 

begin
  # Delete rate limit for endpoint
  api_instance.rate_limits_endpoint_id_delete(endpoint_id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling RateLimitsApi->rate_limits_endpoint_id_delete: #{e}"
end
```

#### Using the rate_limits_endpoint_id_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> rate_limits_endpoint_id_delete_with_http_info(endpoint_id)

```ruby
begin
  # Delete rate limit for endpoint
  data, status_code, headers = api_instance.rate_limits_endpoint_id_delete_with_http_info(endpoint_id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling RateLimitsApi->rate_limits_endpoint_id_delete_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## rate_limits_endpoint_id_get

> rate_limits_endpoint_id_get(endpoint_id)

Get rate limit for endpoint

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::RateLimitsApi.new
endpoint_id = 'endpoint_id_example' # String | 

begin
  # Get rate limit for endpoint
  api_instance.rate_limits_endpoint_id_get(endpoint_id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling RateLimitsApi->rate_limits_endpoint_id_get: #{e}"
end
```

#### Using the rate_limits_endpoint_id_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> rate_limits_endpoint_id_get_with_http_info(endpoint_id)

```ruby
begin
  # Get rate limit for endpoint
  data, status_code, headers = api_instance.rate_limits_endpoint_id_get_with_http_info(endpoint_id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling RateLimitsApi->rate_limits_endpoint_id_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## rate_limits_endpoint_id_post

> rate_limits_endpoint_id_post(endpoint_id)

Set rate limit for endpoint

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::RateLimitsApi.new
endpoint_id = 'endpoint_id_example' # String | 

begin
  # Set rate limit for endpoint
  api_instance.rate_limits_endpoint_id_post(endpoint_id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling RateLimitsApi->rate_limits_endpoint_id_post: #{e}"
end
```

#### Using the rate_limits_endpoint_id_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> rate_limits_endpoint_id_post_with_http_info(endpoint_id)

```ruby
begin
  # Set rate limit for endpoint
  data, status_code, headers = api_instance.rate_limits_endpoint_id_post_with_http_info(endpoint_id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling RateLimitsApi->rate_limits_endpoint_id_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## rate_limits_get

> rate_limits_get

List rate limits

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::RateLimitsApi.new

begin
  # List rate limits
  api_instance.rate_limits_get
rescue OpenapiClient::ApiError => e
  puts "Error when calling RateLimitsApi->rate_limits_get: #{e}"
end
```

#### Using the rate_limits_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> rate_limits_get_with_http_info

```ruby
begin
  # List rate limits
  data, status_code, headers = api_instance.rate_limits_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling RateLimitsApi->rate_limits_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

