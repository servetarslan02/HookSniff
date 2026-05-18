# OpenapiClient::SimulatorApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**simulator_post**](SimulatorApi.md#simulator_post) | **POST** /simulator | Simulate a webhook delivery |


## simulator_post

> simulator_post(opts)

Simulate a webhook delivery

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::SimulatorApi.new
opts = {
  simulator_post_request: OpenapiClient::SimulatorPostRequest.new # SimulatorPostRequest | 
}

begin
  # Simulate a webhook delivery
  api_instance.simulator_post(opts)
rescue OpenapiClient::ApiError => e
  puts "Error when calling SimulatorApi->simulator_post: #{e}"
end
```

#### Using the simulator_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> simulator_post_with_http_info(opts)

```ruby
begin
  # Simulate a webhook delivery
  data, status_code, headers = api_instance.simulator_post_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling SimulatorApi->simulator_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **simulator_post_request** | [**SimulatorPostRequest**](SimulatorPostRequest.md) |  | [optional] |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

