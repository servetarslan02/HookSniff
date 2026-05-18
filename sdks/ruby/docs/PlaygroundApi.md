# OpenapiClient::PlaygroundApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**playground_get**](PlaygroundApi.md#playground_get) | **GET** /playground | Get playground info (endpoints, sample payloads) |
| [**playground_test_post**](PlaygroundApi.md#playground_test_post) | **POST** /playground/test | Test a webhook delivery |


## playground_get

> <PlaygroundGet200Response> playground_get

Get playground info (endpoints, sample payloads)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::PlaygroundApi.new

begin
  # Get playground info (endpoints, sample payloads)
  result = api_instance.playground_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling PlaygroundApi->playground_get: #{e}"
end
```

#### Using the playground_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<PlaygroundGet200Response>, Integer, Hash)> playground_get_with_http_info

```ruby
begin
  # Get playground info (endpoints, sample payloads)
  data, status_code, headers = api_instance.playground_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <PlaygroundGet200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling PlaygroundApi->playground_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**PlaygroundGet200Response**](PlaygroundGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## playground_test_post

> <TestWebhookResponse> playground_test_post(test_webhook_request)

Test a webhook delivery

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::PlaygroundApi.new
test_webhook_request = OpenapiClient::TestWebhookRequest.new({endpoint_id: 'endpoint_id_example', payload: 3.56}) # TestWebhookRequest | 

begin
  # Test a webhook delivery
  result = api_instance.playground_test_post(test_webhook_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling PlaygroundApi->playground_test_post: #{e}"
end
```

#### Using the playground_test_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<TestWebhookResponse>, Integer, Hash)> playground_test_post_with_http_info(test_webhook_request)

```ruby
begin
  # Test a webhook delivery
  data, status_code, headers = api_instance.playground_test_post_with_http_info(test_webhook_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <TestWebhookResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling PlaygroundApi->playground_test_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **test_webhook_request** | [**TestWebhookRequest**](TestWebhookRequest.md) |  |  |

### Return type

[**TestWebhookResponse**](TestWebhookResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

