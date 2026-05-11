# OpenapiClient::SSOApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**sso_config_delete**](SSOApi.md#sso_config_delete) | **DELETE** /sso/config | Delete SSO configuration |
| [**sso_config_get**](SSOApi.md#sso_config_get) | **GET** /sso/config | Get SSO configuration |
| [**sso_config_post**](SSOApi.md#sso_config_post) | **POST** /sso/config | Create/update SSO configuration |
| [**sso_test_post**](SSOApi.md#sso_test_post) | **POST** /sso/test | Test SSO connection |


## sso_config_delete

> sso_config_delete

Delete SSO configuration

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::SSOApi.new

begin
  # Delete SSO configuration
  api_instance.sso_config_delete
rescue OpenapiClient::ApiError => e
  puts "Error when calling SSOApi->sso_config_delete: #{e}"
end
```

#### Using the sso_config_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> sso_config_delete_with_http_info

```ruby
begin
  # Delete SSO configuration
  data, status_code, headers = api_instance.sso_config_delete_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling SSOApi->sso_config_delete_with_http_info: #{e}"
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


## sso_config_get

> sso_config_get

Get SSO configuration

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::SSOApi.new

begin
  # Get SSO configuration
  api_instance.sso_config_get
rescue OpenapiClient::ApiError => e
  puts "Error when calling SSOApi->sso_config_get: #{e}"
end
```

#### Using the sso_config_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> sso_config_get_with_http_info

```ruby
begin
  # Get SSO configuration
  data, status_code, headers = api_instance.sso_config_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling SSOApi->sso_config_get_with_http_info: #{e}"
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


## sso_config_post

> sso_config_post(opts)

Create/update SSO configuration

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::SSOApi.new
opts = {
  sso_config_post_request: OpenapiClient::SsoConfigPostRequest.new # SsoConfigPostRequest | 
}

begin
  # Create/update SSO configuration
  api_instance.sso_config_post(opts)
rescue OpenapiClient::ApiError => e
  puts "Error when calling SSOApi->sso_config_post: #{e}"
end
```

#### Using the sso_config_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> sso_config_post_with_http_info(opts)

```ruby
begin
  # Create/update SSO configuration
  data, status_code, headers = api_instance.sso_config_post_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling SSOApi->sso_config_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **sso_config_post_request** | [**SsoConfigPostRequest**](SsoConfigPostRequest.md) |  | [optional] |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## sso_test_post

> sso_test_post

Test SSO connection

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::SSOApi.new

begin
  # Test SSO connection
  api_instance.sso_test_post
rescue OpenapiClient::ApiError => e
  puts "Error when calling SSOApi->sso_test_post: #{e}"
end
```

#### Using the sso_test_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> sso_test_post_with_http_info

```ruby
begin
  # Test SSO connection
  data, status_code, headers = api_instance.sso_test_post_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling SSOApi->sso_test_post_with_http_info: #{e}"
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

