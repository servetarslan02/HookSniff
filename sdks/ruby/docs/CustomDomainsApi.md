# OpenapiClient::CustomDomainsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**custom_domains_get**](CustomDomainsApi.md#custom_domains_get) | **GET** /custom-domains | List custom domains |
| [**custom_domains_id_delete**](CustomDomainsApi.md#custom_domains_id_delete) | **DELETE** /custom-domains/{id} | Delete custom domain |
| [**custom_domains_id_verify_post**](CustomDomainsApi.md#custom_domains_id_verify_post) | **POST** /custom-domains/{id}/verify | Verify domain ownership |
| [**custom_domains_post**](CustomDomainsApi.md#custom_domains_post) | **POST** /custom-domains | Add custom domain |


## custom_domains_get

> custom_domains_get

List custom domains

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomDomainsApi.new

begin
  # List custom domains
  api_instance.custom_domains_get
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomDomainsApi->custom_domains_get: #{e}"
end
```

#### Using the custom_domains_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> custom_domains_get_with_http_info

```ruby
begin
  # List custom domains
  data, status_code, headers = api_instance.custom_domains_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomDomainsApi->custom_domains_get_with_http_info: #{e}"
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


## custom_domains_id_delete

> custom_domains_id_delete(id)

Delete custom domain

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomDomainsApi.new
id = 'id_example' # String | 

begin
  # Delete custom domain
  api_instance.custom_domains_id_delete(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomDomainsApi->custom_domains_id_delete: #{e}"
end
```

#### Using the custom_domains_id_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> custom_domains_id_delete_with_http_info(id)

```ruby
begin
  # Delete custom domain
  data, status_code, headers = api_instance.custom_domains_id_delete_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomDomainsApi->custom_domains_id_delete_with_http_info: #{e}"
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


## custom_domains_id_verify_post

> custom_domains_id_verify_post(id)

Verify domain ownership

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomDomainsApi.new
id = 'id_example' # String | 

begin
  # Verify domain ownership
  api_instance.custom_domains_id_verify_post(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomDomainsApi->custom_domains_id_verify_post: #{e}"
end
```

#### Using the custom_domains_id_verify_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> custom_domains_id_verify_post_with_http_info(id)

```ruby
begin
  # Verify domain ownership
  data, status_code, headers = api_instance.custom_domains_id_verify_post_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomDomainsApi->custom_domains_id_verify_post_with_http_info: #{e}"
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


## custom_domains_post

> custom_domains_post(opts)

Add custom domain

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomDomainsApi.new
opts = {
  custom_domains_post_request: OpenapiClient::CustomDomainsPostRequest.new # CustomDomainsPostRequest | 
}

begin
  # Add custom domain
  api_instance.custom_domains_post(opts)
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomDomainsApi->custom_domains_post: #{e}"
end
```

#### Using the custom_domains_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> custom_domains_post_with_http_info(opts)

```ruby
begin
  # Add custom domain
  data, status_code, headers = api_instance.custom_domains_post_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomDomainsApi->custom_domains_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **custom_domains_post_request** | [**CustomDomainsPostRequest**](CustomDomainsPostRequest.md) |  | [optional] |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

