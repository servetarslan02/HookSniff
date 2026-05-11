# OpenapiClient::RoutingApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**endpoints_id_health_get**](RoutingApi.md#endpoints_id_health_get) | **GET** /endpoints/{id}/health | Get endpoint health status |
| [**endpoints_id_routing_get**](RoutingApi.md#endpoints_id_routing_get) | **GET** /endpoints/{id}/routing | Get routing config for endpoint |
| [**endpoints_id_routing_put**](RoutingApi.md#endpoints_id_routing_put) | **PUT** /endpoints/{id}/routing | Update routing config |
| [**routing_id_health_get**](RoutingApi.md#routing_id_health_get) | **GET** /routing/{id}/health | Get endpoint health status |
| [**routing_id_routing_get**](RoutingApi.md#routing_id_routing_get) | **GET** /routing/{id}/routing | Get routing config for endpoint |
| [**routing_id_routing_put**](RoutingApi.md#routing_id_routing_put) | **PUT** /routing/{id}/routing | Update routing config |


## endpoints_id_health_get

> <EndpointHealth> endpoints_id_health_get(id)

Get endpoint health status

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::RoutingApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Get endpoint health status
  result = api_instance.endpoints_id_health_get(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling RoutingApi->endpoints_id_health_get: #{e}"
end
```

#### Using the endpoints_id_health_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<EndpointHealth>, Integer, Hash)> endpoints_id_health_get_with_http_info(id)

```ruby
begin
  # Get endpoint health status
  data, status_code, headers = api_instance.endpoints_id_health_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <EndpointHealth>
rescue OpenapiClient::ApiError => e
  puts "Error when calling RoutingApi->endpoints_id_health_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**EndpointHealth**](EndpointHealth.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## endpoints_id_routing_get

> <RoutingInfo> endpoints_id_routing_get(id)

Get routing config for endpoint

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::RoutingApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Get routing config for endpoint
  result = api_instance.endpoints_id_routing_get(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling RoutingApi->endpoints_id_routing_get: #{e}"
end
```

#### Using the endpoints_id_routing_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<RoutingInfo>, Integer, Hash)> endpoints_id_routing_get_with_http_info(id)

```ruby
begin
  # Get routing config for endpoint
  data, status_code, headers = api_instance.endpoints_id_routing_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <RoutingInfo>
rescue OpenapiClient::ApiError => e
  puts "Error when calling RoutingApi->endpoints_id_routing_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**RoutingInfo**](RoutingInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## endpoints_id_routing_put

> <RoutingInfo> endpoints_id_routing_put(id, update_routing_request)

Update routing config

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::RoutingApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
update_routing_request = OpenapiClient::UpdateRoutingRequest.new # UpdateRoutingRequest | 

begin
  # Update routing config
  result = api_instance.endpoints_id_routing_put(id, update_routing_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling RoutingApi->endpoints_id_routing_put: #{e}"
end
```

#### Using the endpoints_id_routing_put_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<RoutingInfo>, Integer, Hash)> endpoints_id_routing_put_with_http_info(id, update_routing_request)

```ruby
begin
  # Update routing config
  data, status_code, headers = api_instance.endpoints_id_routing_put_with_http_info(id, update_routing_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <RoutingInfo>
rescue OpenapiClient::ApiError => e
  puts "Error when calling RoutingApi->endpoints_id_routing_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **update_routing_request** | [**UpdateRoutingRequest**](UpdateRoutingRequest.md) |  |  |

### Return type

[**RoutingInfo**](RoutingInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## routing_id_health_get

> routing_id_health_get(id)

Get endpoint health status

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::RoutingApi.new
id = 'id_example' # String | 

begin
  # Get endpoint health status
  api_instance.routing_id_health_get(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling RoutingApi->routing_id_health_get: #{e}"
end
```

#### Using the routing_id_health_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> routing_id_health_get_with_http_info(id)

```ruby
begin
  # Get endpoint health status
  data, status_code, headers = api_instance.routing_id_health_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling RoutingApi->routing_id_health_get_with_http_info: #{e}"
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


## routing_id_routing_get

> routing_id_routing_get(id)

Get routing config for endpoint

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::RoutingApi.new
id = 'id_example' # String | 

begin
  # Get routing config for endpoint
  api_instance.routing_id_routing_get(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling RoutingApi->routing_id_routing_get: #{e}"
end
```

#### Using the routing_id_routing_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> routing_id_routing_get_with_http_info(id)

```ruby
begin
  # Get routing config for endpoint
  data, status_code, headers = api_instance.routing_id_routing_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling RoutingApi->routing_id_routing_get_with_http_info: #{e}"
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


## routing_id_routing_put

> routing_id_routing_put(id)

Update routing config

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::RoutingApi.new
id = 'id_example' # String | 

begin
  # Update routing config
  api_instance.routing_id_routing_put(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling RoutingApi->routing_id_routing_put: #{e}"
end
```

#### Using the routing_id_routing_put_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> routing_id_routing_put_with_http_info(id)

```ruby
begin
  # Update routing config
  data, status_code, headers = api_instance.routing_id_routing_put_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling RoutingApi->routing_id_routing_put_with_http_info: #{e}"
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

