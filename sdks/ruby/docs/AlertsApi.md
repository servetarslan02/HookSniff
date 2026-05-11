# OpenapiClient::AlertsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**alerts_get**](AlertsApi.md#alerts_get) | **GET** /alerts | List alert rules |
| [**alerts_id_delete**](AlertsApi.md#alerts_id_delete) | **DELETE** /alerts/{id} | Delete alert rule |
| [**alerts_id_get**](AlertsApi.md#alerts_id_get) | **GET** /alerts/{id} | Get alert rule |
| [**alerts_id_test_post**](AlertsApi.md#alerts_id_test_post) | **POST** /alerts/{id}/test | Test an alert rule |
| [**alerts_post**](AlertsApi.md#alerts_post) | **POST** /alerts | Create alert rule |


## alerts_get

> <Array<AlertRule>> alerts_get

List alert rules

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AlertsApi.new

begin
  # List alert rules
  result = api_instance.alerts_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AlertsApi->alerts_get: #{e}"
end
```

#### Using the alerts_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<AlertRule>>, Integer, Hash)> alerts_get_with_http_info

```ruby
begin
  # List alert rules
  data, status_code, headers = api_instance.alerts_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<AlertRule>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AlertsApi->alerts_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;AlertRule&gt;**](AlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## alerts_id_delete

> alerts_id_delete(id)

Delete alert rule

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AlertsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Delete alert rule
  api_instance.alerts_id_delete(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling AlertsApi->alerts_id_delete: #{e}"
end
```

#### Using the alerts_id_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> alerts_id_delete_with_http_info(id)

```ruby
begin
  # Delete alert rule
  data, status_code, headers = api_instance.alerts_id_delete_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AlertsApi->alerts_id_delete_with_http_info: #{e}"
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


## alerts_id_get

> <AlertRule> alerts_id_get(id)

Get alert rule

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AlertsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Get alert rule
  result = api_instance.alerts_id_get(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AlertsApi->alerts_id_get: #{e}"
end
```

#### Using the alerts_id_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AlertRule>, Integer, Hash)> alerts_id_get_with_http_info(id)

```ruby
begin
  # Get alert rule
  data, status_code, headers = api_instance.alerts_id_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AlertRule>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AlertsApi->alerts_id_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**AlertRule**](AlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## alerts_id_test_post

> alerts_id_test_post(id)

Test an alert rule

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AlertsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Test an alert rule
  api_instance.alerts_id_test_post(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling AlertsApi->alerts_id_test_post: #{e}"
end
```

#### Using the alerts_id_test_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> alerts_id_test_post_with_http_info(id)

```ruby
begin
  # Test an alert rule
  data, status_code, headers = api_instance.alerts_id_test_post_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AlertsApi->alerts_id_test_post_with_http_info: #{e}"
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


## alerts_post

> <AlertRule> alerts_post(create_alert_request)

Create alert rule

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AlertsApi.new
create_alert_request = OpenapiClient::CreateAlertRequest.new({name: 'name_example', condition: 'failure_rate', threshold: 37, channels: ['channels_example']}) # CreateAlertRequest | 

begin
  # Create alert rule
  result = api_instance.alerts_post(create_alert_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AlertsApi->alerts_post: #{e}"
end
```

#### Using the alerts_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AlertRule>, Integer, Hash)> alerts_post_with_http_info(create_alert_request)

```ruby
begin
  # Create alert rule
  data, status_code, headers = api_instance.alerts_post_with_http_info(create_alert_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AlertRule>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AlertsApi->alerts_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **create_alert_request** | [**CreateAlertRequest**](CreateAlertRequest.md) |  |  |

### Return type

[**AlertRule**](AlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

