# OpenapiClient::SchemasApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**schemas_get**](SchemasApi.md#schemas_get) | **GET** /schemas | List registered schemas |
| [**schemas_id_get**](SchemasApi.md#schemas_id_get) | **GET** /schemas/{id} | Get schema by ID |
| [**schemas_id_validate_post**](SchemasApi.md#schemas_id_validate_post) | **POST** /schemas/{id}/validate | Validate an event against a schema |
| [**schemas_post**](SchemasApi.md#schemas_post) | **POST** /schemas | Register a new JSON Schema |


## schemas_get

> schemas_get

List registered schemas

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::SchemasApi.new

begin
  # List registered schemas
  api_instance.schemas_get
rescue OpenapiClient::ApiError => e
  puts "Error when calling SchemasApi->schemas_get: #{e}"
end
```

#### Using the schemas_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> schemas_get_with_http_info

```ruby
begin
  # List registered schemas
  data, status_code, headers = api_instance.schemas_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling SchemasApi->schemas_get_with_http_info: #{e}"
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


## schemas_id_get

> schemas_id_get(id)

Get schema by ID

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::SchemasApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Get schema by ID
  api_instance.schemas_id_get(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling SchemasApi->schemas_id_get: #{e}"
end
```

#### Using the schemas_id_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> schemas_id_get_with_http_info(id)

```ruby
begin
  # Get schema by ID
  data, status_code, headers = api_instance.schemas_id_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling SchemasApi->schemas_id_get_with_http_info: #{e}"
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


## schemas_id_validate_post

> schemas_id_validate_post(id, validate_event_request)

Validate an event against a schema

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::SchemasApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
validate_event_request = OpenapiClient::ValidateEventRequest.new({event: 3.56}) # ValidateEventRequest | 

begin
  # Validate an event against a schema
  api_instance.schemas_id_validate_post(id, validate_event_request)
rescue OpenapiClient::ApiError => e
  puts "Error when calling SchemasApi->schemas_id_validate_post: #{e}"
end
```

#### Using the schemas_id_validate_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> schemas_id_validate_post_with_http_info(id, validate_event_request)

```ruby
begin
  # Validate an event against a schema
  data, status_code, headers = api_instance.schemas_id_validate_post_with_http_info(id, validate_event_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling SchemasApi->schemas_id_validate_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **validate_event_request** | [**ValidateEventRequest**](ValidateEventRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## schemas_post

> schemas_post(register_schema_request)

Register a new JSON Schema

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::SchemasApi.new
register_schema_request = OpenapiClient::RegisterSchemaRequest.new({name: 'name_example', schema: 3.56}) # RegisterSchemaRequest | 

begin
  # Register a new JSON Schema
  api_instance.schemas_post(register_schema_request)
rescue OpenapiClient::ApiError => e
  puts "Error when calling SchemasApi->schemas_post: #{e}"
end
```

#### Using the schemas_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> schemas_post_with_http_info(register_schema_request)

```ruby
begin
  # Register a new JSON Schema
  data, status_code, headers = api_instance.schemas_post_with_http_info(register_schema_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling SchemasApi->schemas_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **register_schema_request** | [**RegisterSchemaRequest**](RegisterSchemaRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

