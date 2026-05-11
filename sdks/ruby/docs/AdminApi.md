# HookSniff::AdminApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**admin_revenue_get**](AdminApi.md#admin_revenue_get) | **GET** /admin/revenue | Revenue by month (admin) |
| [**admin_sdk_update_post**](AdminApi.md#admin_sdk_update_post) | **POST** /admin/sdk-update | Send SDK update notification to users |
| [**admin_stats_get**](AdminApi.md#admin_stats_get) | **GET** /admin/stats | System-wide statistics (admin) |
| [**admin_users_get**](AdminApi.md#admin_users_get) | **GET** /admin/users | List all users (admin) |
| [**admin_users_id_get**](AdminApi.md#admin_users_id_get) | **GET** /admin/users/{id} | Get user details (admin) |
| [**admin_users_id_plan_put**](AdminApi.md#admin_users_id_plan_put) | **PUT** /admin/users/{id}/plan | Change user plan (admin) |
| [**admin_users_id_status_put**](AdminApi.md#admin_users_id_status_put) | **PUT** /admin/users/{id}/status | Change user status (admin) |


## admin_revenue_get

> <Array<AdminRevenueGet200ResponseInner>> admin_revenue_get

Revenue by month (admin)

### Examples

```ruby
require 'time'
require 'hooksniff'
# setup authorization
HookSniff.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = HookSniff::AdminApi.new

begin
  # Revenue by month (admin)
  result = api_instance.admin_revenue_get
  p result
rescue HookSniff::ApiError => e
  puts "Error when calling AdminApi->admin_revenue_get: #{e}"
end
```

#### Using the admin_revenue_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<AdminRevenueGet200ResponseInner>>, Integer, Hash)> admin_revenue_get_with_http_info

```ruby
begin
  # Revenue by month (admin)
  data, status_code, headers = api_instance.admin_revenue_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<AdminRevenueGet200ResponseInner>>
rescue HookSniff::ApiError => e
  puts "Error when calling AdminApi->admin_revenue_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;AdminRevenueGet200ResponseInner&gt;**](AdminRevenueGet200ResponseInner.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## admin_sdk_update_post

> admin_sdk_update_post(opts)

Send SDK update notification to users

### Examples

```ruby
require 'time'
require 'hooksniff'
# setup authorization
HookSniff.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = HookSniff::AdminApi.new
opts = {
  admin_sdk_update_post_request: HookSniff::AdminSdkUpdatePostRequest.new # AdminSdkUpdatePostRequest | 
}

begin
  # Send SDK update notification to users
  api_instance.admin_sdk_update_post(opts)
rescue HookSniff::ApiError => e
  puts "Error when calling AdminApi->admin_sdk_update_post: #{e}"
end
```

#### Using the admin_sdk_update_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> admin_sdk_update_post_with_http_info(opts)

```ruby
begin
  # Send SDK update notification to users
  data, status_code, headers = api_instance.admin_sdk_update_post_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue HookSniff::ApiError => e
  puts "Error when calling AdminApi->admin_sdk_update_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **admin_sdk_update_post_request** | [**AdminSdkUpdatePostRequest**](AdminSdkUpdatePostRequest.md) |  | [optional] |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## admin_stats_get

> <SystemStats> admin_stats_get

System-wide statistics (admin)

### Examples

```ruby
require 'time'
require 'hooksniff'
# setup authorization
HookSniff.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = HookSniff::AdminApi.new

begin
  # System-wide statistics (admin)
  result = api_instance.admin_stats_get
  p result
rescue HookSniff::ApiError => e
  puts "Error when calling AdminApi->admin_stats_get: #{e}"
end
```

#### Using the admin_stats_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SystemStats>, Integer, Hash)> admin_stats_get_with_http_info

```ruby
begin
  # System-wide statistics (admin)
  data, status_code, headers = api_instance.admin_stats_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SystemStats>
rescue HookSniff::ApiError => e
  puts "Error when calling AdminApi->admin_stats_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**SystemStats**](SystemStats.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## admin_users_get

> <PaginatedUsers> admin_users_get(opts)

List all users (admin)

### Examples

```ruby
require 'time'
require 'hooksniff'
# setup authorization
HookSniff.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = HookSniff::AdminApi.new
opts = {
  page: 56, # Integer | 
  per_page: 56 # Integer | 
}

begin
  # List all users (admin)
  result = api_instance.admin_users_get(opts)
  p result
rescue HookSniff::ApiError => e
  puts "Error when calling AdminApi->admin_users_get: #{e}"
end
```

#### Using the admin_users_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<PaginatedUsers>, Integer, Hash)> admin_users_get_with_http_info(opts)

```ruby
begin
  # List all users (admin)
  data, status_code, headers = api_instance.admin_users_get_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <PaginatedUsers>
rescue HookSniff::ApiError => e
  puts "Error when calling AdminApi->admin_users_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **page** | **Integer** |  | [optional] |
| **per_page** | **Integer** |  | [optional] |

### Return type

[**PaginatedUsers**](PaginatedUsers.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## admin_users_id_get

> admin_users_id_get(id)

Get user details (admin)

### Examples

```ruby
require 'time'
require 'hooksniff'
# setup authorization
HookSniff.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = HookSniff::AdminApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Get user details (admin)
  api_instance.admin_users_id_get(id)
rescue HookSniff::ApiError => e
  puts "Error when calling AdminApi->admin_users_id_get: #{e}"
end
```

#### Using the admin_users_id_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> admin_users_id_get_with_http_info(id)

```ruby
begin
  # Get user details (admin)
  data, status_code, headers = api_instance.admin_users_id_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue HookSniff::ApiError => e
  puts "Error when calling AdminApi->admin_users_id_get_with_http_info: #{e}"
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


## admin_users_id_plan_put

> admin_users_id_plan_put(id, admin_users_id_plan_put_request)

Change user plan (admin)

### Examples

```ruby
require 'time'
require 'hooksniff'
# setup authorization
HookSniff.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = HookSniff::AdminApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
admin_users_id_plan_put_request = HookSniff::AdminUsersIdPlanPutRequest.new # AdminUsersIdPlanPutRequest | 

begin
  # Change user plan (admin)
  api_instance.admin_users_id_plan_put(id, admin_users_id_plan_put_request)
rescue HookSniff::ApiError => e
  puts "Error when calling AdminApi->admin_users_id_plan_put: #{e}"
end
```

#### Using the admin_users_id_plan_put_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> admin_users_id_plan_put_with_http_info(id, admin_users_id_plan_put_request)

```ruby
begin
  # Change user plan (admin)
  data, status_code, headers = api_instance.admin_users_id_plan_put_with_http_info(id, admin_users_id_plan_put_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue HookSniff::ApiError => e
  puts "Error when calling AdminApi->admin_users_id_plan_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **admin_users_id_plan_put_request** | [**AdminUsersIdPlanPutRequest**](AdminUsersIdPlanPutRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## admin_users_id_status_put

> admin_users_id_status_put(id, admin_users_id_status_put_request)

Change user status (admin)

### Examples

```ruby
require 'time'
require 'hooksniff'
# setup authorization
HookSniff.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = HookSniff::AdminApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
admin_users_id_status_put_request = HookSniff::AdminUsersIdStatusPutRequest.new # AdminUsersIdStatusPutRequest | 

begin
  # Change user status (admin)
  api_instance.admin_users_id_status_put(id, admin_users_id_status_put_request)
rescue HookSniff::ApiError => e
  puts "Error when calling AdminApi->admin_users_id_status_put: #{e}"
end
```

#### Using the admin_users_id_status_put_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> admin_users_id_status_put_with_http_info(id, admin_users_id_status_put_request)

```ruby
begin
  # Change user status (admin)
  data, status_code, headers = api_instance.admin_users_id_status_put_with_http_info(id, admin_users_id_status_put_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue HookSniff::ApiError => e
  puts "Error when calling AdminApi->admin_users_id_status_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **admin_users_id_status_put_request** | [**AdminUsersIdStatusPutRequest**](AdminUsersIdStatusPutRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

