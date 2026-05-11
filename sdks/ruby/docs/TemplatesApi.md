# OpenapiClient::TemplatesApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**templates_get**](TemplatesApi.md#templates_get) | **GET** /templates | List available templates |
| [**templates_id_apply_post**](TemplatesApi.md#templates_id_apply_post) | **POST** /templates/{id}/apply | Apply template to an endpoint |
| [**templates_id_get**](TemplatesApi.md#templates_id_get) | **GET** /templates/{id} | Get template by ID |


## templates_get

> <Array<WebhookTemplate>> templates_get(opts)

List available templates

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TemplatesApi.new
opts = {
  category: 'category_example' # String | 
}

begin
  # List available templates
  result = api_instance.templates_get(opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling TemplatesApi->templates_get: #{e}"
end
```

#### Using the templates_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<WebhookTemplate>>, Integer, Hash)> templates_get_with_http_info(opts)

```ruby
begin
  # List available templates
  data, status_code, headers = api_instance.templates_get_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<WebhookTemplate>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling TemplatesApi->templates_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **category** | **String** |  | [optional] |

### Return type

[**Array&lt;WebhookTemplate&gt;**](WebhookTemplate.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## templates_id_apply_post

> <ApplyTemplateResponse> templates_id_apply_post(id, apply_template_request)

Apply template to an endpoint

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TemplatesApi.new
id = 'id_example' # String | 
apply_template_request = OpenapiClient::ApplyTemplateRequest.new({endpoint_id: 'endpoint_id_example'}) # ApplyTemplateRequest | 

begin
  # Apply template to an endpoint
  result = api_instance.templates_id_apply_post(id, apply_template_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling TemplatesApi->templates_id_apply_post: #{e}"
end
```

#### Using the templates_id_apply_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<ApplyTemplateResponse>, Integer, Hash)> templates_id_apply_post_with_http_info(id, apply_template_request)

```ruby
begin
  # Apply template to an endpoint
  data, status_code, headers = api_instance.templates_id_apply_post_with_http_info(id, apply_template_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <ApplyTemplateResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling TemplatesApi->templates_id_apply_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **apply_template_request** | [**ApplyTemplateRequest**](ApplyTemplateRequest.md) |  |  |

### Return type

[**ApplyTemplateResponse**](ApplyTemplateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## templates_id_get

> <WebhookTemplate> templates_id_get(id)

Get template by ID

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TemplatesApi.new
id = 'id_example' # String | 

begin
  # Get template by ID
  result = api_instance.templates_id_get(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling TemplatesApi->templates_id_get: #{e}"
end
```

#### Using the templates_id_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<WebhookTemplate>, Integer, Hash)> templates_id_get_with_http_info(id)

```ruby
begin
  # Get template by ID
  data, status_code, headers = api_instance.templates_id_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <WebhookTemplate>
rescue OpenapiClient::ApiError => e
  puts "Error when calling TemplatesApi->templates_id_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**WebhookTemplate**](WebhookTemplate.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

