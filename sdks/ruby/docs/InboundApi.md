# OpenapiClient::InboundApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**inbound_configs_get**](InboundApi.md#inbound_configs_get) | **GET** /inbound/configs | List inbound webhook configs |
| [**inbound_configs_id_delete**](InboundApi.md#inbound_configs_id_delete) | **DELETE** /inbound/configs/{id} | Delete inbound config |
| [**inbound_configs_id_put**](InboundApi.md#inbound_configs_id_put) | **PUT** /inbound/configs/{id} | Update inbound config |
| [**inbound_configs_post**](InboundApi.md#inbound_configs_post) | **POST** /inbound/configs | Create inbound webhook config |
| [**inbound_provider_endpoint_id_post**](InboundApi.md#inbound_provider_endpoint_id_post) | **POST** /inbound/{provider}/{endpoint_id} | Receive inbound webhook for a specific endpoint |
| [**inbound_provider_post**](InboundApi.md#inbound_provider_post) | **POST** /inbound/{provider} | Receive inbound webhook from a provider |


## inbound_configs_get

> <Array<InboundConfig>> inbound_configs_get

List inbound webhook configs

Returns all inbound webhook configurations for the authenticated user

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

begin
  # List inbound webhook configs
  result = api_instance.inbound_configs_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling InboundApi->inbound_configs_get: #{e}"
end
```

#### Using the inbound_configs_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<InboundConfig>>, Integer, Hash)> inbound_configs_get_with_http_info

```ruby
begin
  # List inbound webhook configs
  data, status_code, headers = api_instance.inbound_configs_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<InboundConfig>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling InboundApi->inbound_configs_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;InboundConfig&gt;**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## inbound_configs_id_delete

> inbound_configs_id_delete(id)

Delete inbound config

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
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Delete inbound config
  api_instance.inbound_configs_id_delete(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling InboundApi->inbound_configs_id_delete: #{e}"
end
```

#### Using the inbound_configs_id_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> inbound_configs_id_delete_with_http_info(id)

```ruby
begin
  # Delete inbound config
  data, status_code, headers = api_instance.inbound_configs_id_delete_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling InboundApi->inbound_configs_id_delete_with_http_info: #{e}"
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


## inbound_configs_id_put

> <InboundConfig> inbound_configs_id_put(id, opts)

Update inbound config

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
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
opts = {
  inbound_configs_id_put_request: OpenapiClient::InboundConfigsIdPutRequest.new # InboundConfigsIdPutRequest | 
}

begin
  # Update inbound config
  result = api_instance.inbound_configs_id_put(id, opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling InboundApi->inbound_configs_id_put: #{e}"
end
```

#### Using the inbound_configs_id_put_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<InboundConfig>, Integer, Hash)> inbound_configs_id_put_with_http_info(id, opts)

```ruby
begin
  # Update inbound config
  data, status_code, headers = api_instance.inbound_configs_id_put_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <InboundConfig>
rescue OpenapiClient::ApiError => e
  puts "Error when calling InboundApi->inbound_configs_id_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **inbound_configs_id_put_request** | [**InboundConfigsIdPutRequest**](InboundConfigsIdPutRequest.md) |  | [optional] |

### Return type

[**InboundConfig**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## inbound_configs_post

> <InboundConfig> inbound_configs_post(inbound_configs_post_request)

Create inbound webhook config

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
inbound_configs_post_request = OpenapiClient::InboundConfigsPostRequest.new({provider: 'provider_example', secret: 'secret_example'}) # InboundConfigsPostRequest | 

begin
  # Create inbound webhook config
  result = api_instance.inbound_configs_post(inbound_configs_post_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling InboundApi->inbound_configs_post: #{e}"
end
```

#### Using the inbound_configs_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<InboundConfig>, Integer, Hash)> inbound_configs_post_with_http_info(inbound_configs_post_request)

```ruby
begin
  # Create inbound webhook config
  data, status_code, headers = api_instance.inbound_configs_post_with_http_info(inbound_configs_post_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <InboundConfig>
rescue OpenapiClient::ApiError => e
  puts "Error when calling InboundApi->inbound_configs_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **inbound_configs_post_request** | [**InboundConfigsPostRequest**](InboundConfigsPostRequest.md) |  |  |

### Return type

[**InboundConfig**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


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

