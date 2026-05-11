# OpenapiClient::TransformsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**endpoints_endpoint_id_transforms_get**](TransformsApi.md#endpoints_endpoint_id_transforms_get) | **GET** /endpoints/{endpoint_id}/transforms | List transform rules for endpoint |
| [**endpoints_endpoint_id_transforms_id_delete**](TransformsApi.md#endpoints_endpoint_id_transforms_id_delete) | **DELETE** /endpoints/{endpoint_id}/transforms/{id} | Delete transform rule |
| [**endpoints_endpoint_id_transforms_id_put**](TransformsApi.md#endpoints_endpoint_id_transforms_id_put) | **PUT** /endpoints/{endpoint_id}/transforms/{id} | Update transform rule |
| [**endpoints_endpoint_id_transforms_post**](TransformsApi.md#endpoints_endpoint_id_transforms_post) | **POST** /endpoints/{endpoint_id}/transforms | Create transform rule |
| [**endpoints_endpoint_id_transforms_test_post**](TransformsApi.md#endpoints_endpoint_id_transforms_test_post) | **POST** /endpoints/{endpoint_id}/transforms/test | Test a transform rule |


## endpoints_endpoint_id_transforms_get

> <Array<TransformRule>> endpoints_endpoint_id_transforms_get(endpoint_id)

List transform rules for endpoint

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TransformsApi.new
endpoint_id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # List transform rules for endpoint
  result = api_instance.endpoints_endpoint_id_transforms_get(endpoint_id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling TransformsApi->endpoints_endpoint_id_transforms_get: #{e}"
end
```

#### Using the endpoints_endpoint_id_transforms_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<TransformRule>>, Integer, Hash)> endpoints_endpoint_id_transforms_get_with_http_info(endpoint_id)

```ruby
begin
  # List transform rules for endpoint
  data, status_code, headers = api_instance.endpoints_endpoint_id_transforms_get_with_http_info(endpoint_id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<TransformRule>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling TransformsApi->endpoints_endpoint_id_transforms_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  |  |

### Return type

[**Array&lt;TransformRule&gt;**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## endpoints_endpoint_id_transforms_id_delete

> endpoints_endpoint_id_transforms_id_delete(endpoint_id, id)

Delete transform rule

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TransformsApi.new
endpoint_id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Delete transform rule
  api_instance.endpoints_endpoint_id_transforms_id_delete(endpoint_id, id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling TransformsApi->endpoints_endpoint_id_transforms_id_delete: #{e}"
end
```

#### Using the endpoints_endpoint_id_transforms_id_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> endpoints_endpoint_id_transforms_id_delete_with_http_info(endpoint_id, id)

```ruby
begin
  # Delete transform rule
  data, status_code, headers = api_instance.endpoints_endpoint_id_transforms_id_delete_with_http_info(endpoint_id, id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling TransformsApi->endpoints_endpoint_id_transforms_id_delete_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  |  |
| **id** | **String** |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## endpoints_endpoint_id_transforms_id_put

> <TransformRule> endpoints_endpoint_id_transforms_id_put(endpoint_id, id, body)

Update transform rule

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TransformsApi.new
endpoint_id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
body = { ... } # Object | 

begin
  # Update transform rule
  result = api_instance.endpoints_endpoint_id_transforms_id_put(endpoint_id, id, body)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling TransformsApi->endpoints_endpoint_id_transforms_id_put: #{e}"
end
```

#### Using the endpoints_endpoint_id_transforms_id_put_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<TransformRule>, Integer, Hash)> endpoints_endpoint_id_transforms_id_put_with_http_info(endpoint_id, id, body)

```ruby
begin
  # Update transform rule
  data, status_code, headers = api_instance.endpoints_endpoint_id_transforms_id_put_with_http_info(endpoint_id, id, body)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <TransformRule>
rescue OpenapiClient::ApiError => e
  puts "Error when calling TransformsApi->endpoints_endpoint_id_transforms_id_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  |  |
| **id** | **String** |  |  |
| **body** | **Object** |  |  |

### Return type

[**TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## endpoints_endpoint_id_transforms_post

> <TransformRule> endpoints_endpoint_id_transforms_post(endpoint_id, create_transform_rule_request)

Create transform rule

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TransformsApi.new
endpoint_id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
create_transform_rule_request = OpenapiClient::CreateTransformRuleRequest.new({name: 'name_example', rule_type: 'rule_type_example', config: 3.56}) # CreateTransformRuleRequest | 

begin
  # Create transform rule
  result = api_instance.endpoints_endpoint_id_transforms_post(endpoint_id, create_transform_rule_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling TransformsApi->endpoints_endpoint_id_transforms_post: #{e}"
end
```

#### Using the endpoints_endpoint_id_transforms_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<TransformRule>, Integer, Hash)> endpoints_endpoint_id_transforms_post_with_http_info(endpoint_id, create_transform_rule_request)

```ruby
begin
  # Create transform rule
  data, status_code, headers = api_instance.endpoints_endpoint_id_transforms_post_with_http_info(endpoint_id, create_transform_rule_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <TransformRule>
rescue OpenapiClient::ApiError => e
  puts "Error when calling TransformsApi->endpoints_endpoint_id_transforms_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  |  |
| **create_transform_rule_request** | [**CreateTransformRuleRequest**](CreateTransformRuleRequest.md) |  |  |

### Return type

[**TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## endpoints_endpoint_id_transforms_test_post

> endpoints_endpoint_id_transforms_test_post(endpoint_id, endpoints_endpoint_id_transforms_test_post_request)

Test a transform rule

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TransformsApi.new
endpoint_id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
endpoints_endpoint_id_transforms_test_post_request = OpenapiClient::EndpointsEndpointIdTransformsTestPostRequest.new # EndpointsEndpointIdTransformsTestPostRequest | 

begin
  # Test a transform rule
  api_instance.endpoints_endpoint_id_transforms_test_post(endpoint_id, endpoints_endpoint_id_transforms_test_post_request)
rescue OpenapiClient::ApiError => e
  puts "Error when calling TransformsApi->endpoints_endpoint_id_transforms_test_post: #{e}"
end
```

#### Using the endpoints_endpoint_id_transforms_test_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> endpoints_endpoint_id_transforms_test_post_with_http_info(endpoint_id, endpoints_endpoint_id_transforms_test_post_request)

```ruby
begin
  # Test a transform rule
  data, status_code, headers = api_instance.endpoints_endpoint_id_transforms_test_post_with_http_info(endpoint_id, endpoints_endpoint_id_transforms_test_post_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling TransformsApi->endpoints_endpoint_id_transforms_test_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  |  |
| **endpoints_endpoint_id_transforms_test_post_request** | [**EndpointsEndpointIdTransformsTestPostRequest**](EndpointsEndpointIdTransformsTestPostRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

