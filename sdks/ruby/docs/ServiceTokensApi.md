# OpenapiClient::ServiceTokensApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**service_tokens_get**](ServiceTokensApi.md#service_tokens_get) | **GET** /service-tokens | List service tokens |
| [**service_tokens_id_delete**](ServiceTokensApi.md#service_tokens_id_delete) | **DELETE** /service-tokens/{id} | Delete service token |
| [**service_tokens_id_put**](ServiceTokensApi.md#service_tokens_id_put) | **PUT** /service-tokens/{id} | Update service token |
| [**service_tokens_id_reveal_post**](ServiceTokensApi.md#service_tokens_id_reveal_post) | **POST** /service-tokens/{id}/reveal | Reveal service token |
| [**service_tokens_post**](ServiceTokensApi.md#service_tokens_post) | **POST** /service-tokens | Create a service token |


## service_tokens_get

> <Array<ServiceToken>> service_tokens_get

List service tokens

Returns all service tokens for the authenticated user

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::ServiceTokensApi.new

begin
  # List service tokens
  result = api_instance.service_tokens_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling ServiceTokensApi->service_tokens_get: #{e}"
end
```

#### Using the service_tokens_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<ServiceToken>>, Integer, Hash)> service_tokens_get_with_http_info

```ruby
begin
  # List service tokens
  data, status_code, headers = api_instance.service_tokens_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<ServiceToken>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling ServiceTokensApi->service_tokens_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;ServiceToken&gt;**](ServiceToken.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## service_tokens_id_delete

> service_tokens_id_delete(id)

Delete service token

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::ServiceTokensApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Delete service token
  api_instance.service_tokens_id_delete(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling ServiceTokensApi->service_tokens_id_delete: #{e}"
end
```

#### Using the service_tokens_id_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> service_tokens_id_delete_with_http_info(id)

```ruby
begin
  # Delete service token
  data, status_code, headers = api_instance.service_tokens_id_delete_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling ServiceTokensApi->service_tokens_id_delete_with_http_info: #{e}"
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


## service_tokens_id_put

> service_tokens_id_put(id, opts)

Update service token

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::ServiceTokensApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
opts = {
  service_tokens_id_put_request: OpenapiClient::ServiceTokensIdPutRequest.new # ServiceTokensIdPutRequest | 
}

begin
  # Update service token
  api_instance.service_tokens_id_put(id, opts)
rescue OpenapiClient::ApiError => e
  puts "Error when calling ServiceTokensApi->service_tokens_id_put: #{e}"
end
```

#### Using the service_tokens_id_put_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> service_tokens_id_put_with_http_info(id, opts)

```ruby
begin
  # Update service token
  data, status_code, headers = api_instance.service_tokens_id_put_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling ServiceTokensApi->service_tokens_id_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **service_tokens_id_put_request** | [**ServiceTokensIdPutRequest**](ServiceTokensIdPutRequest.md) |  | [optional] |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## service_tokens_id_reveal_post

> <ServiceTokensIdRevealPost200Response> service_tokens_id_reveal_post(id)

Reveal service token

Returns the full token value (only available once after creation, or via this endpoint)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::ServiceTokensApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Reveal service token
  result = api_instance.service_tokens_id_reveal_post(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling ServiceTokensApi->service_tokens_id_reveal_post: #{e}"
end
```

#### Using the service_tokens_id_reveal_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<ServiceTokensIdRevealPost200Response>, Integer, Hash)> service_tokens_id_reveal_post_with_http_info(id)

```ruby
begin
  # Reveal service token
  data, status_code, headers = api_instance.service_tokens_id_reveal_post_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <ServiceTokensIdRevealPost200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling ServiceTokensApi->service_tokens_id_reveal_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**ServiceTokensIdRevealPost200Response**](ServiceTokensIdRevealPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## service_tokens_post

> <ServiceTokenCreateResponse> service_tokens_post(service_tokens_post_request)

Create a service token

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::ServiceTokensApi.new
service_tokens_post_request = OpenapiClient::ServiceTokensPostRequest.new({name: 'name_example'}) # ServiceTokensPostRequest | 

begin
  # Create a service token
  result = api_instance.service_tokens_post(service_tokens_post_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling ServiceTokensApi->service_tokens_post: #{e}"
end
```

#### Using the service_tokens_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<ServiceTokenCreateResponse>, Integer, Hash)> service_tokens_post_with_http_info(service_tokens_post_request)

```ruby
begin
  # Create a service token
  data, status_code, headers = api_instance.service_tokens_post_with_http_info(service_tokens_post_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <ServiceTokenCreateResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling ServiceTokensApi->service_tokens_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **service_tokens_post_request** | [**ServiceTokensPostRequest**](ServiceTokensPostRequest.md) |  |  |

### Return type

[**ServiceTokenCreateResponse**](ServiceTokenCreateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

