# OpenapiClient::AnalyticsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**analytics_deliveries_get**](AnalyticsApi.md#analytics_deliveries_get) | **GET** /analytics/deliveries | Delivery trend over time |
| [**analytics_latency_get**](AnalyticsApi.md#analytics_latency_get) | **GET** /analytics/latency | Latency trend over time |
| [**analytics_success_rate_get**](AnalyticsApi.md#analytics_success_rate_get) | **GET** /analytics/success-rate | Success rate metrics |


## analytics_deliveries_get

> <DeliveryTrendResponse> analytics_deliveries_get(opts)

Delivery trend over time

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AnalyticsApi.new
opts = {
  range: '24h' # String | 
}

begin
  # Delivery trend over time
  result = api_instance.analytics_deliveries_get(opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AnalyticsApi->analytics_deliveries_get: #{e}"
end
```

#### Using the analytics_deliveries_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<DeliveryTrendResponse>, Integer, Hash)> analytics_deliveries_get_with_http_info(opts)

```ruby
begin
  # Delivery trend over time
  data, status_code, headers = api_instance.analytics_deliveries_get_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <DeliveryTrendResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AnalyticsApi->analytics_deliveries_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **range** | **String** |  | [optional][default to &#39;24h&#39;] |

### Return type

[**DeliveryTrendResponse**](DeliveryTrendResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## analytics_latency_get

> <LatencyTrendResponse> analytics_latency_get(opts)

Latency trend over time

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AnalyticsApi.new
opts = {
  range: '24h' # String | 
}

begin
  # Latency trend over time
  result = api_instance.analytics_latency_get(opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AnalyticsApi->analytics_latency_get: #{e}"
end
```

#### Using the analytics_latency_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<LatencyTrendResponse>, Integer, Hash)> analytics_latency_get_with_http_info(opts)

```ruby
begin
  # Latency trend over time
  data, status_code, headers = api_instance.analytics_latency_get_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <LatencyTrendResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AnalyticsApi->analytics_latency_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **range** | **String** |  | [optional][default to &#39;24h&#39;] |

### Return type

[**LatencyTrendResponse**](LatencyTrendResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## analytics_success_rate_get

> <SuccessRateResponse> analytics_success_rate_get(opts)

Success rate metrics

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AnalyticsApi.new
opts = {
  range: '24h' # String | 
}

begin
  # Success rate metrics
  result = api_instance.analytics_success_rate_get(opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AnalyticsApi->analytics_success_rate_get: #{e}"
end
```

#### Using the analytics_success_rate_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SuccessRateResponse>, Integer, Hash)> analytics_success_rate_get_with_http_info(opts)

```ruby
begin
  # Success rate metrics
  data, status_code, headers = api_instance.analytics_success_rate_get_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SuccessRateResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AnalyticsApi->analytics_success_rate_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **range** | **String** |  | [optional][default to &#39;24h&#39;] |

### Return type

[**SuccessRateResponse**](SuccessRateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

