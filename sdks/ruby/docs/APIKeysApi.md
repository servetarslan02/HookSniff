# OpenapiClient::APIKeysApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**api_keys_get**](APIKeysApi.md#api_keys_get) | **GET** /api-keys | List API keys |
| [**api_keys_id_delete**](APIKeysApi.md#api_keys_id_delete) | **DELETE** /api-keys/{id} | Delete (revoke) an API key |
| [**api_keys_id_rotate_post**](APIKeysApi.md#api_keys_id_rotate_post) | **POST** /api-keys/{id}/rotate | Rotate an API key |
| [**api_keys_post**](APIKeysApi.md#api_keys_post) | **POST** /api-keys | Create a new API key |


## api_keys_get

> <Array<ApiKeyInfo>> api_keys_get

List API keys

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::APIKeysApi.new

begin
  # List API keys
  result = api_instance.api_keys_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling APIKeysApi->api_keys_get: #{e}"
end
```

#### Using the api_keys_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<ApiKeyInfo>>, Integer, Hash)> api_keys_get_with_http_info

```ruby
begin
  # List API keys
  data, status_code, headers = api_instance.api_keys_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<ApiKeyInfo>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling APIKeysApi->api_keys_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;ApiKeyInfo&gt;**](ApiKeyInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## api_keys_id_delete

> api_keys_id_delete(id)

Delete (revoke) an API key

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::APIKeysApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Delete (revoke) an API key
  api_instance.api_keys_id_delete(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling APIKeysApi->api_keys_id_delete: #{e}"
end
```

#### Using the api_keys_id_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> api_keys_id_delete_with_http_info(id)

```ruby
begin
  # Delete (revoke) an API key
  data, status_code, headers = api_instance.api_keys_id_delete_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling APIKeysApi->api_keys_id_delete_with_http_info: #{e}"
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


## api_keys_id_rotate_post

> <CreateApiKeyResponse> api_keys_id_rotate_post(id)

Rotate an API key

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::APIKeysApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Rotate an API key
  result = api_instance.api_keys_id_rotate_post(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling APIKeysApi->api_keys_id_rotate_post: #{e}"
end
```

#### Using the api_keys_id_rotate_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<CreateApiKeyResponse>, Integer, Hash)> api_keys_id_rotate_post_with_http_info(id)

```ruby
begin
  # Rotate an API key
  data, status_code, headers = api_instance.api_keys_id_rotate_post_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <CreateApiKeyResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling APIKeysApi->api_keys_id_rotate_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## api_keys_post

> <CreateApiKeyResponse> api_keys_post

Create a new API key

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::APIKeysApi.new

begin
  # Create a new API key
  result = api_instance.api_keys_post
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling APIKeysApi->api_keys_post: #{e}"
end
```

#### Using the api_keys_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<CreateApiKeyResponse>, Integer, Hash)> api_keys_post_with_http_info

```ruby
begin
  # Create a new API key
  data, status_code, headers = api_instance.api_keys_post_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <CreateApiKeyResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling APIKeysApi->api_keys_post_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

