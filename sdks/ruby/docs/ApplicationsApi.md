# OpenapiClient::ApplicationsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**applications_get**](ApplicationsApi.md#applications_get) | **GET** /applications | List applications |
| [**applications_id_delete**](ApplicationsApi.md#applications_id_delete) | **DELETE** /applications/{id} | Delete application |
| [**applications_id_get**](ApplicationsApi.md#applications_id_get) | **GET** /applications/{id} | Get application |
| [**applications_id_put**](ApplicationsApi.md#applications_id_put) | **PUT** /applications/{id} | Update application |
| [**applications_post**](ApplicationsApi.md#applications_post) | **POST** /applications | Create application |


## applications_get

> <Array<Application>> applications_get

List applications

Returns all applications for the authenticated user

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::ApplicationsApi.new

begin
  # List applications
  result = api_instance.applications_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling ApplicationsApi->applications_get: #{e}"
end
```

#### Using the applications_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<Application>>, Integer, Hash)> applications_get_with_http_info

```ruby
begin
  # List applications
  data, status_code, headers = api_instance.applications_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<Application>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling ApplicationsApi->applications_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;Application&gt;**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## applications_id_delete

> applications_id_delete(id)

Delete application

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::ApplicationsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Delete application
  api_instance.applications_id_delete(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling ApplicationsApi->applications_id_delete: #{e}"
end
```

#### Using the applications_id_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> applications_id_delete_with_http_info(id)

```ruby
begin
  # Delete application
  data, status_code, headers = api_instance.applications_id_delete_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling ApplicationsApi->applications_id_delete_with_http_info: #{e}"
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


## applications_id_get

> <Application> applications_id_get(id)

Get application

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::ApplicationsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Get application
  result = api_instance.applications_id_get(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling ApplicationsApi->applications_id_get: #{e}"
end
```

#### Using the applications_id_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Application>, Integer, Hash)> applications_id_get_with_http_info(id)

```ruby
begin
  # Get application
  data, status_code, headers = api_instance.applications_id_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Application>
rescue OpenapiClient::ApiError => e
  puts "Error when calling ApplicationsApi->applications_id_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## applications_id_put

> <Application> applications_id_put(id, opts)

Update application

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::ApplicationsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
opts = {
  applications_id_put_request: OpenapiClient::ApplicationsIdPutRequest.new # ApplicationsIdPutRequest | 
}

begin
  # Update application
  result = api_instance.applications_id_put(id, opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling ApplicationsApi->applications_id_put: #{e}"
end
```

#### Using the applications_id_put_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Application>, Integer, Hash)> applications_id_put_with_http_info(id, opts)

```ruby
begin
  # Update application
  data, status_code, headers = api_instance.applications_id_put_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Application>
rescue OpenapiClient::ApiError => e
  puts "Error when calling ApplicationsApi->applications_id_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **applications_id_put_request** | [**ApplicationsIdPutRequest**](ApplicationsIdPutRequest.md) |  | [optional] |

### Return type

[**Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## applications_post

> <Application> applications_post(applications_post_request)

Create application

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::ApplicationsApi.new
applications_post_request = OpenapiClient::ApplicationsPostRequest.new({name: 'name_example'}) # ApplicationsPostRequest | 

begin
  # Create application
  result = api_instance.applications_post(applications_post_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling ApplicationsApi->applications_post: #{e}"
end
```

#### Using the applications_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Application>, Integer, Hash)> applications_post_with_http_info(applications_post_request)

```ruby
begin
  # Create application
  data, status_code, headers = api_instance.applications_post_with_http_info(applications_post_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Application>
rescue OpenapiClient::ApiError => e
  puts "Error when calling ApplicationsApi->applications_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **applications_post_request** | [**ApplicationsPostRequest**](ApplicationsPostRequest.md) |  |  |

### Return type

[**Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

