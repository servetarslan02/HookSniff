# OpenapiClient::StreamApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**stream_deliveries_get**](StreamApi.md#stream_deliveries_get) | **GET** /stream/deliveries | Real-time delivery event stream (SSE) |


## stream_deliveries_get

> String stream_deliveries_get(opts)

Real-time delivery event stream (SSE)

Server-Sent Events stream of webhook deliveries

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::StreamApi.new
opts = {
  endpoint_id: '38400000-8cf0-11bd-b23e-10b96e4ef00d', # String | 
  status: 'status_example', # String | 
  limit: 56 # Integer | 
}

begin
  # Real-time delivery event stream (SSE)
  result = api_instance.stream_deliveries_get(opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling StreamApi->stream_deliveries_get: #{e}"
end
```

#### Using the stream_deliveries_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(String, Integer, Hash)> stream_deliveries_get_with_http_info(opts)

```ruby
begin
  # Real-time delivery event stream (SSE)
  data, status_code, headers = api_instance.stream_deliveries_get_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => String
rescue OpenapiClient::ApiError => e
  puts "Error when calling StreamApi->stream_deliveries_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  | [optional] |
| **status** | **String** |  | [optional] |
| **limit** | **Integer** |  | [optional][default to 50] |

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/event-stream

