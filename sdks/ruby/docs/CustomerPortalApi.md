# OpenapiClient::CustomerPortalApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**portal_api_keys_get**](CustomerPortalApi.md#portal_api_keys_get) | **GET** /portal/api-keys | List API keys (portal) |
| [**portal_api_keys_key_id_delete**](CustomerPortalApi.md#portal_api_keys_key_id_delete) | **DELETE** /portal/api-keys/{key_id} | Revoke API key (portal) |
| [**portal_api_keys_post**](CustomerPortalApi.md#portal_api_keys_post) | **POST** /portal/api-keys | Create API key (portal) |
| [**portal_config_get**](CustomerPortalApi.md#portal_config_get) | **GET** /portal/config | Get portal configuration |
| [**portal_config_post**](CustomerPortalApi.md#portal_config_post) | **POST** /portal/config | Update portal configuration |
| [**portal_embed_code_get**](CustomerPortalApi.md#portal_embed_code_get) | **GET** /portal/embed-code | Get portal embed code |
| [**portal_me_get**](CustomerPortalApi.md#portal_me_get) | **GET** /portal/me | Get portal profile |
| [**portal_me_put**](CustomerPortalApi.md#portal_me_put) | **PUT** /portal/me | Update portal profile |
| [**portal_notifications_get**](CustomerPortalApi.md#portal_notifications_get) | **GET** /portal/notifications | Get notification preferences (portal) |
| [**portal_notifications_put**](CustomerPortalApi.md#portal_notifications_put) | **PUT** /portal/notifications | Update notification preferences (portal) |
| [**portal_plan_get**](CustomerPortalApi.md#portal_plan_get) | **GET** /portal/plan | Get plan info (portal) |
| [**portal_usage_get**](CustomerPortalApi.md#portal_usage_get) | **GET** /portal/usage | Get usage (portal) |


## portal_api_keys_get

> <Array<ApiKeyInfo>> portal_api_keys_get

List API keys (portal)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomerPortalApi.new

begin
  # List API keys (portal)
  result = api_instance.portal_api_keys_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_api_keys_get: #{e}"
end
```

#### Using the portal_api_keys_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<ApiKeyInfo>>, Integer, Hash)> portal_api_keys_get_with_http_info

```ruby
begin
  # List API keys (portal)
  data, status_code, headers = api_instance.portal_api_keys_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<ApiKeyInfo>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_api_keys_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;ApiKeyInfo&gt;**](ApiKeyInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## portal_api_keys_key_id_delete

> portal_api_keys_key_id_delete(key_id)

Revoke API key (portal)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomerPortalApi.new
key_id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Revoke API key (portal)
  api_instance.portal_api_keys_key_id_delete(key_id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_api_keys_key_id_delete: #{e}"
end
```

#### Using the portal_api_keys_key_id_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> portal_api_keys_key_id_delete_with_http_info(key_id)

```ruby
begin
  # Revoke API key (portal)
  data, status_code, headers = api_instance.portal_api_keys_key_id_delete_with_http_info(key_id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_api_keys_key_id_delete_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **key_id** | **String** |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## portal_api_keys_post

> <CreateApiKeyResponse> portal_api_keys_post

Create API key (portal)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomerPortalApi.new

begin
  # Create API key (portal)
  result = api_instance.portal_api_keys_post
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_api_keys_post: #{e}"
end
```

#### Using the portal_api_keys_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<CreateApiKeyResponse>, Integer, Hash)> portal_api_keys_post_with_http_info

```ruby
begin
  # Create API key (portal)
  data, status_code, headers = api_instance.portal_api_keys_post_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <CreateApiKeyResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_api_keys_post_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## portal_config_get

> portal_config_get

Get portal configuration

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomerPortalApi.new

begin
  # Get portal configuration
  api_instance.portal_config_get
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_config_get: #{e}"
end
```

#### Using the portal_config_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> portal_config_get_with_http_info

```ruby
begin
  # Get portal configuration
  data, status_code, headers = api_instance.portal_config_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_config_get_with_http_info: #{e}"
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


## portal_config_post

> portal_config_post

Update portal configuration

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomerPortalApi.new

begin
  # Update portal configuration
  api_instance.portal_config_post
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_config_post: #{e}"
end
```

#### Using the portal_config_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> portal_config_post_with_http_info

```ruby
begin
  # Update portal configuration
  data, status_code, headers = api_instance.portal_config_post_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_config_post_with_http_info: #{e}"
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


## portal_embed_code_get

> portal_embed_code_get

Get portal embed code

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomerPortalApi.new

begin
  # Get portal embed code
  api_instance.portal_embed_code_get
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_embed_code_get: #{e}"
end
```

#### Using the portal_embed_code_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> portal_embed_code_get_with_http_info

```ruby
begin
  # Get portal embed code
  data, status_code, headers = api_instance.portal_embed_code_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_embed_code_get_with_http_info: #{e}"
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


## portal_me_get

> <PortalProfile> portal_me_get

Get portal profile

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomerPortalApi.new

begin
  # Get portal profile
  result = api_instance.portal_me_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_me_get: #{e}"
end
```

#### Using the portal_me_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<PortalProfile>, Integer, Hash)> portal_me_get_with_http_info

```ruby
begin
  # Get portal profile
  data, status_code, headers = api_instance.portal_me_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <PortalProfile>
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_me_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**PortalProfile**](PortalProfile.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## portal_me_put

> portal_me_put(update_profile_request)

Update portal profile

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomerPortalApi.new
update_profile_request = OpenapiClient::UpdateProfileRequest.new({name: 'name_example', email: 'email_example'}) # UpdateProfileRequest | 

begin
  # Update portal profile
  api_instance.portal_me_put(update_profile_request)
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_me_put: #{e}"
end
```

#### Using the portal_me_put_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> portal_me_put_with_http_info(update_profile_request)

```ruby
begin
  # Update portal profile
  data, status_code, headers = api_instance.portal_me_put_with_http_info(update_profile_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_me_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **update_profile_request** | [**UpdateProfileRequest**](UpdateProfileRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## portal_notifications_get

> <NotificationPreferences> portal_notifications_get

Get notification preferences (portal)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomerPortalApi.new

begin
  # Get notification preferences (portal)
  result = api_instance.portal_notifications_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_notifications_get: #{e}"
end
```

#### Using the portal_notifications_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<NotificationPreferences>, Integer, Hash)> portal_notifications_get_with_http_info

```ruby
begin
  # Get notification preferences (portal)
  data, status_code, headers = api_instance.portal_notifications_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <NotificationPreferences>
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_notifications_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**NotificationPreferences**](NotificationPreferences.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## portal_notifications_put

> <PortalNotificationsPut200Response> portal_notifications_put(update_notification_preferences)

Update notification preferences (portal)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomerPortalApi.new
update_notification_preferences = OpenapiClient::UpdateNotificationPreferences.new({email_on_failure: false, email_on_dead_letter: false, email_on_success: false}) # UpdateNotificationPreferences | 

begin
  # Update notification preferences (portal)
  result = api_instance.portal_notifications_put(update_notification_preferences)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_notifications_put: #{e}"
end
```

#### Using the portal_notifications_put_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<PortalNotificationsPut200Response>, Integer, Hash)> portal_notifications_put_with_http_info(update_notification_preferences)

```ruby
begin
  # Update notification preferences (portal)
  data, status_code, headers = api_instance.portal_notifications_put_with_http_info(update_notification_preferences)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <PortalNotificationsPut200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_notifications_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **update_notification_preferences** | [**UpdateNotificationPreferences**](UpdateNotificationPreferences.md) |  |  |

### Return type

[**PortalNotificationsPut200Response**](PortalNotificationsPut200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## portal_plan_get

> <SubscriptionResponse> portal_plan_get

Get plan info (portal)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomerPortalApi.new

begin
  # Get plan info (portal)
  result = api_instance.portal_plan_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_plan_get: #{e}"
end
```

#### Using the portal_plan_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SubscriptionResponse>, Integer, Hash)> portal_plan_get_with_http_info

```ruby
begin
  # Get plan info (portal)
  data, status_code, headers = api_instance.portal_plan_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SubscriptionResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_plan_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**SubscriptionResponse**](SubscriptionResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## portal_usage_get

> <UsageResponse> portal_usage_get

Get usage (portal)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::CustomerPortalApi.new

begin
  # Get usage (portal)
  result = api_instance.portal_usage_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_usage_get: #{e}"
end
```

#### Using the portal_usage_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<UsageResponse>, Integer, Hash)> portal_usage_get_with_http_info

```ruby
begin
  # Get usage (portal)
  data, status_code, headers = api_instance.portal_usage_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <UsageResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling CustomerPortalApi->portal_usage_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**UsageResponse**](UsageResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

