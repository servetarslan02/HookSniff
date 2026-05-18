# OpenapiClient::DevicesApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**devices_get**](DevicesApi.md#devices_get) | **GET** /devices | List registered devices |
| [**devices_post**](DevicesApi.md#devices_post) | **POST** /devices | Register device for push notifications |
| [**devices_token_delete**](DevicesApi.md#devices_token_delete) | **DELETE** /devices/{token} | Remove device token |


## devices_get

> <Array<DeviceTokenResponse>> devices_get

List registered devices

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::DevicesApi.new

begin
  # List registered devices
  result = api_instance.devices_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling DevicesApi->devices_get: #{e}"
end
```

#### Using the devices_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<DeviceTokenResponse>>, Integer, Hash)> devices_get_with_http_info

```ruby
begin
  # List registered devices
  data, status_code, headers = api_instance.devices_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<DeviceTokenResponse>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling DevicesApi->devices_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;DeviceTokenResponse&gt;**](DeviceTokenResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## devices_post

> <DeviceTokenResponse> devices_post(register_device_request)

Register device for push notifications

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::DevicesApi.new
register_device_request = OpenapiClient::RegisterDeviceRequest.new({token: 'token_example'}) # RegisterDeviceRequest | 

begin
  # Register device for push notifications
  result = api_instance.devices_post(register_device_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling DevicesApi->devices_post: #{e}"
end
```

#### Using the devices_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<DeviceTokenResponse>, Integer, Hash)> devices_post_with_http_info(register_device_request)

```ruby
begin
  # Register device for push notifications
  data, status_code, headers = api_instance.devices_post_with_http_info(register_device_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <DeviceTokenResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling DevicesApi->devices_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **register_device_request** | [**RegisterDeviceRequest**](RegisterDeviceRequest.md) |  |  |

### Return type

[**DeviceTokenResponse**](DeviceTokenResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## devices_token_delete

> devices_token_delete(token)

Remove device token

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::DevicesApi.new
token = 'token_example' # String | 

begin
  # Remove device token
  api_instance.devices_token_delete(token)
rescue OpenapiClient::ApiError => e
  puts "Error when calling DevicesApi->devices_token_delete: #{e}"
end
```

#### Using the devices_token_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> devices_token_delete_with_http_info(token)

```ruby
begin
  # Remove device token
  data, status_code, headers = api_instance.devices_token_delete_with_http_info(token)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling DevicesApi->devices_token_delete_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **token** | **String** |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

