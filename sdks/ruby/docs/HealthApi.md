# OpenapiClient::HealthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**endpoint_health_get**](HealthApi.md#endpoint_health_get) | **GET** /endpoint-health | List endpoint health statuses |
| [**endpoint_health_id_get**](HealthApi.md#endpoint_health_id_get) | **GET** /endpoint-health/{id} | Get specific endpoint health |
| [**status_get**](HealthApi.md#status_get) | **GET** /status | System status (public) |


## endpoint_health_get

> <Array<EndpointHealth>> endpoint_health_get

List endpoint health statuses

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::HealthApi.new

begin
  # List endpoint health statuses
  result = api_instance.endpoint_health_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling HealthApi->endpoint_health_get: #{e}"
end
```

#### Using the endpoint_health_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<EndpointHealth>>, Integer, Hash)> endpoint_health_get_with_http_info

```ruby
begin
  # List endpoint health statuses
  data, status_code, headers = api_instance.endpoint_health_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<EndpointHealth>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling HealthApi->endpoint_health_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;EndpointHealth&gt;**](EndpointHealth.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## endpoint_health_id_get

> <EndpointHealth> endpoint_health_id_get(id)

Get specific endpoint health

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::HealthApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Get specific endpoint health
  result = api_instance.endpoint_health_id_get(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling HealthApi->endpoint_health_id_get: #{e}"
end
```

#### Using the endpoint_health_id_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<EndpointHealth>, Integer, Hash)> endpoint_health_id_get_with_http_info(id)

```ruby
begin
  # Get specific endpoint health
  data, status_code, headers = api_instance.endpoint_health_id_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <EndpointHealth>
rescue OpenapiClient::ApiError => e
  puts "Error when calling HealthApi->endpoint_health_id_get_with_http_info: #{e}"
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


## status_get

> <SystemStatus> status_get

System status (public)

### Examples

```ruby
require 'time'
require 'openapi_client'

api_instance = OpenapiClient::HealthApi.new

begin
  # System status (public)
  result = api_instance.status_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling HealthApi->status_get: #{e}"
end
```

#### Using the status_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SystemStatus>, Integer, Hash)> status_get_with_http_info

```ruby
begin
  # System status (public)
  data, status_code, headers = api_instance.status_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SystemStatus>
rescue OpenapiClient::ApiError => e
  puts "Error when calling HealthApi->status_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**SystemStatus**](SystemStatus.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

