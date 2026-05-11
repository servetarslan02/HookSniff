# OpenapiClient::StatsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**stats_get**](StatsApi.md#stats_get) | **GET** /stats | Get account statistics |


## stats_get

> <StatsResponse> stats_get

Get account statistics

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::StatsApi.new

begin
  # Get account statistics
  result = api_instance.stats_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling StatsApi->stats_get: #{e}"
end
```

#### Using the stats_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<StatsResponse>, Integer, Hash)> stats_get_with_http_info

```ruby
begin
  # Get account statistics
  data, status_code, headers = api_instance.stats_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <StatsResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling StatsApi->stats_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**StatsResponse**](StatsResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

