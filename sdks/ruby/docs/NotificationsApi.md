# OpenapiClient::NotificationsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**notifications_get**](NotificationsApi.md#notifications_get) | **GET** /notifications | List notifications |
| [**notifications_id_delete**](NotificationsApi.md#notifications_id_delete) | **DELETE** /notifications/{id} | Delete notification |
| [**notifications_id_read_put**](NotificationsApi.md#notifications_id_read_put) | **PUT** /notifications/{id}/read | Mark notification as read |
| [**notifications_read_all_put**](NotificationsApi.md#notifications_read_all_put) | **PUT** /notifications/read-all | Mark all notifications as read |
| [**notifications_unread_count_get**](NotificationsApi.md#notifications_unread_count_get) | **GET** /notifications/unread-count | Get unread notification count |


## notifications_get

> <NotificationListResponse> notifications_get(opts)

List notifications

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::NotificationsApi.new
opts = {
  page: 56, # Integer | 
  per_page: 56 # Integer | 
}

begin
  # List notifications
  result = api_instance.notifications_get(opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling NotificationsApi->notifications_get: #{e}"
end
```

#### Using the notifications_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<NotificationListResponse>, Integer, Hash)> notifications_get_with_http_info(opts)

```ruby
begin
  # List notifications
  data, status_code, headers = api_instance.notifications_get_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <NotificationListResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling NotificationsApi->notifications_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **page** | **Integer** |  | [optional] |
| **per_page** | **Integer** |  | [optional] |

### Return type

[**NotificationListResponse**](NotificationListResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## notifications_id_delete

> notifications_id_delete(id)

Delete notification

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::NotificationsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Delete notification
  api_instance.notifications_id_delete(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling NotificationsApi->notifications_id_delete: #{e}"
end
```

#### Using the notifications_id_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> notifications_id_delete_with_http_info(id)

```ruby
begin
  # Delete notification
  data, status_code, headers = api_instance.notifications_id_delete_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling NotificationsApi->notifications_id_delete_with_http_info: #{e}"
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


## notifications_id_read_put

> notifications_id_read_put(id)

Mark notification as read

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::NotificationsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Mark notification as read
  api_instance.notifications_id_read_put(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling NotificationsApi->notifications_id_read_put: #{e}"
end
```

#### Using the notifications_id_read_put_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> notifications_id_read_put_with_http_info(id)

```ruby
begin
  # Mark notification as read
  data, status_code, headers = api_instance.notifications_id_read_put_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling NotificationsApi->notifications_id_read_put_with_http_info: #{e}"
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


## notifications_read_all_put

> notifications_read_all_put

Mark all notifications as read

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::NotificationsApi.new

begin
  # Mark all notifications as read
  api_instance.notifications_read_all_put
rescue OpenapiClient::ApiError => e
  puts "Error when calling NotificationsApi->notifications_read_all_put: #{e}"
end
```

#### Using the notifications_read_all_put_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> notifications_read_all_put_with_http_info

```ruby
begin
  # Mark all notifications as read
  data, status_code, headers = api_instance.notifications_read_all_put_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling NotificationsApi->notifications_read_all_put_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## notifications_unread_count_get

> <NotificationsUnreadCountGet200Response> notifications_unread_count_get

Get unread notification count

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::NotificationsApi.new

begin
  # Get unread notification count
  result = api_instance.notifications_unread_count_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling NotificationsApi->notifications_unread_count_get: #{e}"
end
```

#### Using the notifications_unread_count_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<NotificationsUnreadCountGet200Response>, Integer, Hash)> notifications_unread_count_get_with_http_info

```ruby
begin
  # Get unread notification count
  data, status_code, headers = api_instance.notifications_unread_count_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <NotificationsUnreadCountGet200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling NotificationsApi->notifications_unread_count_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**NotificationsUnreadCountGet200Response**](NotificationsUnreadCountGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

