# OpenapiClient::EndpointsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**endpoints_get**](EndpointsApi.md#endpoints_get) | **GET** /endpoints | List all endpoints |
| [**endpoints_id_delete**](EndpointsApi.md#endpoints_id_delete) | **DELETE** /endpoints/{id} | Delete endpoint |
| [**endpoints_id_get**](EndpointsApi.md#endpoints_id_get) | **GET** /endpoints/{id} | Get endpoint by ID |
| [**endpoints_id_put**](EndpointsApi.md#endpoints_id_put) | **PUT** /endpoints/{id} | Update endpoint |
| [**endpoints_id_retry_policy_put**](EndpointsApi.md#endpoints_id_retry_policy_put) | **PUT** /endpoints/{id}/retry-policy | Update retry policy for an endpoint |
| [**endpoints_id_rotate_secret_post**](EndpointsApi.md#endpoints_id_rotate_secret_post) | **POST** /endpoints/{id}/rotate-secret | Rotate endpoint signing secret |
| [**endpoints_post**](EndpointsApi.md#endpoints_post) | **POST** /endpoints | Create a new endpoint |


## endpoints_get

> <Array<Endpoint>> endpoints_get

List all endpoints

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::EndpointsApi.new

begin
  # List all endpoints
  result = api_instance.endpoints_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling EndpointsApi->endpoints_get: #{e}"
end
```

#### Using the endpoints_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<Endpoint>>, Integer, Hash)> endpoints_get_with_http_info

```ruby
begin
  # List all endpoints
  data, status_code, headers = api_instance.endpoints_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<Endpoint>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling EndpointsApi->endpoints_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;Endpoint&gt;**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## endpoints_id_delete

> endpoints_id_delete(id)

Delete endpoint

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::EndpointsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Delete endpoint
  api_instance.endpoints_id_delete(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling EndpointsApi->endpoints_id_delete: #{e}"
end
```

#### Using the endpoints_id_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> endpoints_id_delete_with_http_info(id)

```ruby
begin
  # Delete endpoint
  data, status_code, headers = api_instance.endpoints_id_delete_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling EndpointsApi->endpoints_id_delete_with_http_info: #{e}"
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


## endpoints_id_get

> <Endpoint> endpoints_id_get(id)

Get endpoint by ID

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::EndpointsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Get endpoint by ID
  result = api_instance.endpoints_id_get(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling EndpointsApi->endpoints_id_get: #{e}"
end
```

#### Using the endpoints_id_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Endpoint>, Integer, Hash)> endpoints_id_get_with_http_info(id)

```ruby
begin
  # Get endpoint by ID
  data, status_code, headers = api_instance.endpoints_id_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Endpoint>
rescue OpenapiClient::ApiError => e
  puts "Error when calling EndpointsApi->endpoints_id_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## endpoints_id_put

> <Endpoint> endpoints_id_put(id, update_endpoint_request)

Update endpoint

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::EndpointsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
update_endpoint_request = OpenapiClient::UpdateEndpointRequest.new({url: 'url_example', description: 'description_example', is_active: false, allowed_ips: ['allowed_ips_example'], event_filter: ['event_filter_example'], retry_policy: OpenapiClient::RetryPolicy.new({max_attempts: 37, backoff: 'exponential', initial_delay_secs: 37, max_delay_secs: 37}), routing_strategy: 'round-robin', fallback_url: 'fallback_url_example', format: 'standard'}) # UpdateEndpointRequest | 

begin
  # Update endpoint
  result = api_instance.endpoints_id_put(id, update_endpoint_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling EndpointsApi->endpoints_id_put: #{e}"
end
```

#### Using the endpoints_id_put_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Endpoint>, Integer, Hash)> endpoints_id_put_with_http_info(id, update_endpoint_request)

```ruby
begin
  # Update endpoint
  data, status_code, headers = api_instance.endpoints_id_put_with_http_info(id, update_endpoint_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Endpoint>
rescue OpenapiClient::ApiError => e
  puts "Error when calling EndpointsApi->endpoints_id_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **update_endpoint_request** | [**UpdateEndpointRequest**](UpdateEndpointRequest.md) |  |  |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## endpoints_id_retry_policy_put

> <Endpoint> endpoints_id_retry_policy_put(id, retry_policy)

Update retry policy for an endpoint

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::EndpointsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
retry_policy = OpenapiClient::RetryPolicy.new({max_attempts: 37, backoff: 'exponential', initial_delay_secs: 37, max_delay_secs: 37}) # RetryPolicy | 

begin
  # Update retry policy for an endpoint
  result = api_instance.endpoints_id_retry_policy_put(id, retry_policy)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling EndpointsApi->endpoints_id_retry_policy_put: #{e}"
end
```

#### Using the endpoints_id_retry_policy_put_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Endpoint>, Integer, Hash)> endpoints_id_retry_policy_put_with_http_info(id, retry_policy)

```ruby
begin
  # Update retry policy for an endpoint
  data, status_code, headers = api_instance.endpoints_id_retry_policy_put_with_http_info(id, retry_policy)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Endpoint>
rescue OpenapiClient::ApiError => e
  puts "Error when calling EndpointsApi->endpoints_id_retry_policy_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **retry_policy** | [**RetryPolicy**](RetryPolicy.md) |  |  |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## endpoints_id_rotate_secret_post

> <EndpointsIdRotateSecretPost200Response> endpoints_id_rotate_secret_post(id)

Rotate endpoint signing secret

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::EndpointsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Rotate endpoint signing secret
  result = api_instance.endpoints_id_rotate_secret_post(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling EndpointsApi->endpoints_id_rotate_secret_post: #{e}"
end
```

#### Using the endpoints_id_rotate_secret_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<EndpointsIdRotateSecretPost200Response>, Integer, Hash)> endpoints_id_rotate_secret_post_with_http_info(id)

```ruby
begin
  # Rotate endpoint signing secret
  data, status_code, headers = api_instance.endpoints_id_rotate_secret_post_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <EndpointsIdRotateSecretPost200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling EndpointsApi->endpoints_id_rotate_secret_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**EndpointsIdRotateSecretPost200Response**](EndpointsIdRotateSecretPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## endpoints_post

> <Endpoint> endpoints_post(create_endpoint_request)

Create a new endpoint

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::EndpointsApi.new
create_endpoint_request = OpenapiClient::CreateEndpointRequest.new({url: 'url_example'}) # CreateEndpointRequest | 

begin
  # Create a new endpoint
  result = api_instance.endpoints_post(create_endpoint_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling EndpointsApi->endpoints_post: #{e}"
end
```

#### Using the endpoints_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Endpoint>, Integer, Hash)> endpoints_post_with_http_info(create_endpoint_request)

```ruby
begin
  # Create a new endpoint
  data, status_code, headers = api_instance.endpoints_post_with_http_info(create_endpoint_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Endpoint>
rescue OpenapiClient::ApiError => e
  puts "Error when calling EndpointsApi->endpoints_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **create_endpoint_request** | [**CreateEndpointRequest**](CreateEndpointRequest.md) |  |  |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

