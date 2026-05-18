# OpenapiClient::AdminApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**admin_alerts_get**](AdminApi.md#admin_alerts_get) | **GET** /admin/alerts | List all alert rules (admin) |
| [**admin_alerts_id_delete**](AdminApi.md#admin_alerts_id_delete) | **DELETE** /admin/alerts/{id} | Delete an alert rule (admin) |
| [**admin_alerts_id_put**](AdminApi.md#admin_alerts_id_put) | **PUT** /admin/alerts/{id} | Update an alert rule (admin) |
| [**admin_alerts_post**](AdminApi.md#admin_alerts_post) | **POST** /admin/alerts | Create a platform alert rule (admin) |
| [**admin_audit_logs_get**](AdminApi.md#admin_audit_logs_get) | **GET** /admin/audit-logs | List audit logs (admin) |
| [**admin_churn_get**](AdminApi.md#admin_churn_get) | **GET** /admin/churn | Get churn metrics (admin) |
| [**admin_deliveries_id_replay_post**](AdminApi.md#admin_deliveries_id_replay_post) | **POST** /admin/deliveries/{id}/replay | Replay a delivery (admin) |
| [**admin_deploy_info_get**](AdminApi.md#admin_deploy_info_get) | **GET** /admin/deploy-info | Get deploy info |
| [**admin_feature_flags_get**](AdminApi.md#admin_feature_flags_get) | **GET** /admin/feature-flags | List feature flags |
| [**admin_feature_flags_id_delete**](AdminApi.md#admin_feature_flags_id_delete) | **DELETE** /admin/feature-flags/{id} | Delete feature flag |
| [**admin_feature_flags_id_put**](AdminApi.md#admin_feature_flags_id_put) | **PUT** /admin/feature-flags/{id} | Update feature flag |
| [**admin_feature_flags_post**](AdminApi.md#admin_feature_flags_post) | **POST** /admin/feature-flags | Create feature flag |
| [**admin_revenue_export_get**](AdminApi.md#admin_revenue_export_get) | **GET** /admin/revenue/export | Export revenue data as CSV (admin) |
| [**admin_revenue_get**](AdminApi.md#admin_revenue_get) | **GET** /admin/revenue | Revenue analytics (admin) |
| [**admin_sdk_update_post**](AdminApi.md#admin_sdk_update_post) | **POST** /admin/sdk-update | Send SDK update notification to users |
| [**admin_settings_get**](AdminApi.md#admin_settings_get) | **GET** /admin/settings | Get platform settings (admin) |
| [**admin_settings_put**](AdminApi.md#admin_settings_put) | **PUT** /admin/settings | Update platform settings (admin) |
| [**admin_stats_get**](AdminApi.md#admin_stats_get) | **GET** /admin/stats | System-wide statistics (admin) |
| [**admin_test_webhook_post**](AdminApi.md#admin_test_webhook_post) | **POST** /admin/test-webhook | Send a test webhook to a URL (admin) |
| [**admin_users_export_get**](AdminApi.md#admin_users_export_get) | **GET** /admin/users/export | Export users as CSV (admin) |
| [**admin_users_get**](AdminApi.md#admin_users_get) | **GET** /admin/users | List all users (admin) |
| [**admin_users_id_analytics_get**](AdminApi.md#admin_users_id_analytics_get) | **GET** /admin/users/{id}/analytics | Get user analytics (admin) |
| [**admin_users_id_get**](AdminApi.md#admin_users_id_get) | **GET** /admin/users/{id} | Get user details (admin) |
| [**admin_users_id_plan_put**](AdminApi.md#admin_users_id_plan_put) | **PUT** /admin/users/{id}/plan | Change user plan (admin) |
| [**admin_users_id_status_put**](AdminApi.md#admin_users_id_status_put) | **PUT** /admin/users/{id}/status | Change user status (admin) |


## admin_alerts_get

> <Array<AdminAlertRule>> admin_alerts_get

List all alert rules (admin)

Returns all alert rules for the authenticated admin's account

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new

begin
  # List all alert rules (admin)
  result = api_instance.admin_alerts_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_alerts_get: #{e}"
end
```

#### Using the admin_alerts_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<AdminAlertRule>>, Integer, Hash)> admin_alerts_get_with_http_info

```ruby
begin
  # List all alert rules (admin)
  data, status_code, headers = api_instance.admin_alerts_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<AdminAlertRule>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_alerts_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;AdminAlertRule&gt;**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## admin_alerts_id_delete

> <AdminAlertsIdDelete200Response> admin_alerts_id_delete(id)

Delete an alert rule (admin)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Delete an alert rule (admin)
  result = api_instance.admin_alerts_id_delete(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_alerts_id_delete: #{e}"
end
```

#### Using the admin_alerts_id_delete_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AdminAlertsIdDelete200Response>, Integer, Hash)> admin_alerts_id_delete_with_http_info(id)

```ruby
begin
  # Delete an alert rule (admin)
  data, status_code, headers = api_instance.admin_alerts_id_delete_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AdminAlertsIdDelete200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_alerts_id_delete_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**AdminAlertsIdDelete200Response**](AdminAlertsIdDelete200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## admin_alerts_id_put

> <AdminAlertRule> admin_alerts_id_put(id, opts)

Update an alert rule (admin)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
opts = {
  admin_update_alert_request: OpenapiClient::AdminUpdateAlertRequest.new # AdminUpdateAlertRequest | 
}

begin
  # Update an alert rule (admin)
  result = api_instance.admin_alerts_id_put(id, opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_alerts_id_put: #{e}"
end
```

#### Using the admin_alerts_id_put_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AdminAlertRule>, Integer, Hash)> admin_alerts_id_put_with_http_info(id, opts)

```ruby
begin
  # Update an alert rule (admin)
  data, status_code, headers = api_instance.admin_alerts_id_put_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AdminAlertRule>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_alerts_id_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **admin_update_alert_request** | [**AdminUpdateAlertRequest**](AdminUpdateAlertRequest.md) |  | [optional] |

### Return type

[**AdminAlertRule**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## admin_alerts_post

> <AdminAlertRule> admin_alerts_post(admin_create_alert_request)

Create a platform alert rule (admin)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
admin_create_alert_request = OpenapiClient::AdminCreateAlertRequest.new({name: 'name_example', condition: 'failure_rate', threshold: 37, channels: ['slack']}) # AdminCreateAlertRequest | 

begin
  # Create a platform alert rule (admin)
  result = api_instance.admin_alerts_post(admin_create_alert_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_alerts_post: #{e}"
end
```

#### Using the admin_alerts_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AdminAlertRule>, Integer, Hash)> admin_alerts_post_with_http_info(admin_create_alert_request)

```ruby
begin
  # Create a platform alert rule (admin)
  data, status_code, headers = api_instance.admin_alerts_post_with_http_info(admin_create_alert_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AdminAlertRule>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_alerts_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **admin_create_alert_request** | [**AdminCreateAlertRequest**](AdminCreateAlertRequest.md) |  |  |

### Return type

[**AdminAlertRule**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## admin_audit_logs_get

> <AdminAuditLogResponse> admin_audit_logs_get(opts)

List audit logs (admin)

Returns all audit log entries across all users

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
opts = {
  page: 56, # Integer | 
  per_page: 56, # Integer | 
  action: 'action_example', # String | 
  admin_id: '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
}

begin
  # List audit logs (admin)
  result = api_instance.admin_audit_logs_get(opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_audit_logs_get: #{e}"
end
```

#### Using the admin_audit_logs_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AdminAuditLogResponse>, Integer, Hash)> admin_audit_logs_get_with_http_info(opts)

```ruby
begin
  # List audit logs (admin)
  data, status_code, headers = api_instance.admin_audit_logs_get_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AdminAuditLogResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_audit_logs_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **page** | **Integer** |  | [optional][default to 1] |
| **per_page** | **Integer** |  | [optional][default to 50] |
| **action** | **String** |  | [optional] |
| **admin_id** | **String** |  | [optional] |

### Return type

[**AdminAuditLogResponse**](AdminAuditLogResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## admin_churn_get

> <ChurnResponse> admin_churn_get

Get churn metrics (admin)

Lists users who became inactive in the last 30 days

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new

begin
  # Get churn metrics (admin)
  result = api_instance.admin_churn_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_churn_get: #{e}"
end
```

#### Using the admin_churn_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<ChurnResponse>, Integer, Hash)> admin_churn_get_with_http_info

```ruby
begin
  # Get churn metrics (admin)
  data, status_code, headers = api_instance.admin_churn_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <ChurnResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_churn_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**ChurnResponse**](ChurnResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## admin_deliveries_id_replay_post

> <ReplayDeliveryResponse> admin_deliveries_id_replay_post(id)

Replay a delivery (admin)

Creates a new delivery with the same payload as the original

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | Original delivery ID to replay

begin
  # Replay a delivery (admin)
  result = api_instance.admin_deliveries_id_replay_post(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_deliveries_id_replay_post: #{e}"
end
```

#### Using the admin_deliveries_id_replay_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<ReplayDeliveryResponse>, Integer, Hash)> admin_deliveries_id_replay_post_with_http_info(id)

```ruby
begin
  # Replay a delivery (admin)
  data, status_code, headers = api_instance.admin_deliveries_id_replay_post_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <ReplayDeliveryResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_deliveries_id_replay_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** | Original delivery ID to replay |  |

### Return type

[**ReplayDeliveryResponse**](ReplayDeliveryResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## admin_deploy_info_get

> <DeployInfo> admin_deploy_info_get

Get deploy info

Admin-only. Returns current deployment version and build info.

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new

begin
  # Get deploy info
  result = api_instance.admin_deploy_info_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_deploy_info_get: #{e}"
end
```

#### Using the admin_deploy_info_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<DeployInfo>, Integer, Hash)> admin_deploy_info_get_with_http_info

```ruby
begin
  # Get deploy info
  data, status_code, headers = api_instance.admin_deploy_info_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <DeployInfo>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_deploy_info_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**DeployInfo**](DeployInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## admin_feature_flags_get

> <AdminFeatureFlagsGet200Response> admin_feature_flags_get

List feature flags

Admin-only. Returns all feature flags.

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new

begin
  # List feature flags
  result = api_instance.admin_feature_flags_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_feature_flags_get: #{e}"
end
```

#### Using the admin_feature_flags_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AdminFeatureFlagsGet200Response>, Integer, Hash)> admin_feature_flags_get_with_http_info

```ruby
begin
  # List feature flags
  data, status_code, headers = api_instance.admin_feature_flags_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AdminFeatureFlagsGet200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_feature_flags_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**AdminFeatureFlagsGet200Response**](AdminFeatureFlagsGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## admin_feature_flags_id_delete

> admin_feature_flags_id_delete(id)

Delete feature flag

Admin-only. Deletes a feature flag.

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Delete feature flag
  api_instance.admin_feature_flags_id_delete(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_feature_flags_id_delete: #{e}"
end
```

#### Using the admin_feature_flags_id_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> admin_feature_flags_id_delete_with_http_info(id)

```ruby
begin
  # Delete feature flag
  data, status_code, headers = api_instance.admin_feature_flags_id_delete_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_feature_flags_id_delete_with_http_info: #{e}"
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


## admin_feature_flags_id_put

> <FeatureFlag> admin_feature_flags_id_put(id, opts)

Update feature flag

Admin-only. Updates a feature flag.

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
opts = {
  admin_feature_flags_id_put_request: OpenapiClient::AdminFeatureFlagsIdPutRequest.new # AdminFeatureFlagsIdPutRequest | 
}

begin
  # Update feature flag
  result = api_instance.admin_feature_flags_id_put(id, opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_feature_flags_id_put: #{e}"
end
```

#### Using the admin_feature_flags_id_put_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<FeatureFlag>, Integer, Hash)> admin_feature_flags_id_put_with_http_info(id, opts)

```ruby
begin
  # Update feature flag
  data, status_code, headers = api_instance.admin_feature_flags_id_put_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <FeatureFlag>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_feature_flags_id_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **admin_feature_flags_id_put_request** | [**AdminFeatureFlagsIdPutRequest**](AdminFeatureFlagsIdPutRequest.md) |  | [optional] |

### Return type

[**FeatureFlag**](FeatureFlag.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## admin_feature_flags_post

> <FeatureFlag> admin_feature_flags_post(admin_feature_flags_post_request)

Create feature flag

Admin-only. Creates a new feature flag.

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
admin_feature_flags_post_request = OpenapiClient::AdminFeatureFlagsPostRequest.new({name: 'name_example'}) # AdminFeatureFlagsPostRequest | 

begin
  # Create feature flag
  result = api_instance.admin_feature_flags_post(admin_feature_flags_post_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_feature_flags_post: #{e}"
end
```

#### Using the admin_feature_flags_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<FeatureFlag>, Integer, Hash)> admin_feature_flags_post_with_http_info(admin_feature_flags_post_request)

```ruby
begin
  # Create feature flag
  data, status_code, headers = api_instance.admin_feature_flags_post_with_http_info(admin_feature_flags_post_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <FeatureFlag>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_feature_flags_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **admin_feature_flags_post_request** | [**AdminFeatureFlagsPostRequest**](AdminFeatureFlagsPostRequest.md) |  |  |

### Return type

[**FeatureFlag**](FeatureFlag.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## admin_revenue_export_get

> String admin_revenue_export_get(opts)

Export revenue data as CSV (admin)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
opts = {
  format: 'csv', # String | 
  months: 56 # Integer | Number of months to include
}

begin
  # Export revenue data as CSV (admin)
  result = api_instance.admin_revenue_export_get(opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_revenue_export_get: #{e}"
end
```

#### Using the admin_revenue_export_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(String, Integer, Hash)> admin_revenue_export_get_with_http_info(opts)

```ruby
begin
  # Export revenue data as CSV (admin)
  data, status_code, headers = api_instance.admin_revenue_export_get_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => String
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_revenue_export_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **format** | **String** |  | [optional][default to &#39;csv&#39;] |
| **months** | **Integer** | Number of months to include | [optional][default to 12] |

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/csv


## admin_revenue_get

> <RevenueResponse> admin_revenue_get

Revenue analytics (admin)

Returns monthly revenue, revenue by plan, MRR, churn rate, and MRR trend

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new

begin
  # Revenue analytics (admin)
  result = api_instance.admin_revenue_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_revenue_get: #{e}"
end
```

#### Using the admin_revenue_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<RevenueResponse>, Integer, Hash)> admin_revenue_get_with_http_info

```ruby
begin
  # Revenue analytics (admin)
  data, status_code, headers = api_instance.admin_revenue_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <RevenueResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_revenue_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**RevenueResponse**](RevenueResponse.md)

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
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
opts = {
  admin_sdk_update_post_request: OpenapiClient::AdminSdkUpdatePostRequest.new # AdminSdkUpdatePostRequest | 
}

begin
  # Send SDK update notification to users
  api_instance.admin_sdk_update_post(opts)
rescue OpenapiClient::ApiError => e
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
rescue OpenapiClient::ApiError => e
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


## admin_settings_get

> <PlatformSettings> admin_settings_get

Get platform settings (admin)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new

begin
  # Get platform settings (admin)
  result = api_instance.admin_settings_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_settings_get: #{e}"
end
```

#### Using the admin_settings_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<PlatformSettings>, Integer, Hash)> admin_settings_get_with_http_info

```ruby
begin
  # Get platform settings (admin)
  data, status_code, headers = api_instance.admin_settings_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <PlatformSettings>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_settings_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**PlatformSettings**](PlatformSettings.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## admin_settings_put

> <AdminSettingsPut200Response> admin_settings_put(platform_settings)

Update platform settings (admin)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
platform_settings = OpenapiClient::PlatformSettings.new({default_plan: 'default_plan_example', max_endpoints_free: 37, max_endpoints_pro: 37, max_webhooks_free: 37, max_webhooks_pro: 37, rate_limit_free: 37, rate_limit_pro: 37, retry_max_attempts: 37, retention_days_free: 37, retention_days_pro: 37, maintenance_mode: false, signup_enabled: false, plan_price_pro: 3.56, plan_price_business: 3.56}) # PlatformSettings | 

begin
  # Update platform settings (admin)
  result = api_instance.admin_settings_put(platform_settings)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_settings_put: #{e}"
end
```

#### Using the admin_settings_put_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AdminSettingsPut200Response>, Integer, Hash)> admin_settings_put_with_http_info(platform_settings)

```ruby
begin
  # Update platform settings (admin)
  data, status_code, headers = api_instance.admin_settings_put_with_http_info(platform_settings)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AdminSettingsPut200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_settings_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **platform_settings** | [**PlatformSettings**](PlatformSettings.md) |  |  |

### Return type

[**AdminSettingsPut200Response**](AdminSettingsPut200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## admin_stats_get

> <SystemStats> admin_stats_get

System-wide statistics (admin)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new

begin
  # System-wide statistics (admin)
  result = api_instance.admin_stats_get
  p result
rescue OpenapiClient::ApiError => e
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
rescue OpenapiClient::ApiError => e
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


## admin_test_webhook_post

> <AdminTestWebhookResponse> admin_test_webhook_post(admin_test_webhook_request)

Send a test webhook to a URL (admin)

Sends an HTTP POST to the specified URL with SSRF protection

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
admin_test_webhook_request = OpenapiClient::AdminTestWebhookRequest.new({endpoint_url: 'endpoint_url_example', payload: 3.56}) # AdminTestWebhookRequest | 

begin
  # Send a test webhook to a URL (admin)
  result = api_instance.admin_test_webhook_post(admin_test_webhook_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_test_webhook_post: #{e}"
end
```

#### Using the admin_test_webhook_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AdminTestWebhookResponse>, Integer, Hash)> admin_test_webhook_post_with_http_info(admin_test_webhook_request)

```ruby
begin
  # Send a test webhook to a URL (admin)
  data, status_code, headers = api_instance.admin_test_webhook_post_with_http_info(admin_test_webhook_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AdminTestWebhookResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_test_webhook_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **admin_test_webhook_request** | [**AdminTestWebhookRequest**](AdminTestWebhookRequest.md) |  |  |

### Return type

[**AdminTestWebhookResponse**](AdminTestWebhookResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## admin_users_export_get

> String admin_users_export_get(opts)

Export users as CSV (admin)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
opts = {
  format: 'csv', # String | 
  plan: 'free', # String | Filter by plan
  status: 'active' # String | Filter by status
}

begin
  # Export users as CSV (admin)
  result = api_instance.admin_users_export_get(opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_users_export_get: #{e}"
end
```

#### Using the admin_users_export_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(String, Integer, Hash)> admin_users_export_get_with_http_info(opts)

```ruby
begin
  # Export users as CSV (admin)
  data, status_code, headers = api_instance.admin_users_export_get_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => String
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_users_export_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **format** | **String** |  | [optional][default to &#39;csv&#39;] |
| **plan** | **String** | Filter by plan | [optional] |
| **status** | **String** | Filter by status | [optional] |

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/csv


## admin_users_get

> <PaginatedUsers> admin_users_get(opts)

List all users (admin)

Returns paginated list of users with optional filters

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
opts = {
  page: 56, # Integer | 
  per_page: 56, # Integer | 
  search: 'search_example', # String | Search by email or name (ILIKE)
  plan: 'free', # String | Filter by plan
  status: 'active', # String | Filter by status
  created_after: Date.parse('2013-10-20'), # Date | Filter users created after this date (ISO 8601)
  created_before: Date.parse('2013-10-20') # Date | Filter users created before this date (ISO 8601)
}

begin
  # List all users (admin)
  result = api_instance.admin_users_get(opts)
  p result
rescue OpenapiClient::ApiError => e
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
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_users_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **page** | **Integer** |  | [optional][default to 1] |
| **per_page** | **Integer** |  | [optional][default to 20] |
| **search** | **String** | Search by email or name (ILIKE) | [optional] |
| **plan** | **String** | Filter by plan | [optional] |
| **status** | **String** | Filter by status | [optional] |
| **created_after** | **Date** | Filter users created after this date (ISO 8601) | [optional] |
| **created_before** | **Date** | Filter users created before this date (ISO 8601) | [optional] |

### Return type

[**PaginatedUsers**](PaginatedUsers.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## admin_users_id_analytics_get

> <UserAnalytics> admin_users_id_analytics_get(id, opts)

Get user analytics (admin)

Returns delivery analytics for a specific user over a time period

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
opts = {
  days: 56 # Integer | Number of days to analyze
}

begin
  # Get user analytics (admin)
  result = api_instance.admin_users_id_analytics_get(id, opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_users_id_analytics_get: #{e}"
end
```

#### Using the admin_users_id_analytics_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<UserAnalytics>, Integer, Hash)> admin_users_id_analytics_get_with_http_info(id, opts)

```ruby
begin
  # Get user analytics (admin)
  data, status_code, headers = api_instance.admin_users_id_analytics_get_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <UserAnalytics>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_users_id_analytics_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **days** | **Integer** | Number of days to analyze | [optional][default to 30] |

### Return type

[**UserAnalytics**](UserAnalytics.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## admin_users_id_get

> <AdminUsersIdGet200Response> admin_users_id_get(id)

Get user details (admin)

Returns user details with endpoints, recent deliveries, and usage stats

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Get user details (admin)
  result = api_instance.admin_users_id_get(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_users_id_get: #{e}"
end
```

#### Using the admin_users_id_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AdminUsersIdGet200Response>, Integer, Hash)> admin_users_id_get_with_http_info(id)

```ruby
begin
  # Get user details (admin)
  data, status_code, headers = api_instance.admin_users_id_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AdminUsersIdGet200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AdminApi->admin_users_id_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**AdminUsersIdGet200Response**](AdminUsersIdGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## admin_users_id_plan_put

> admin_users_id_plan_put(id, admin_users_id_plan_put_request)

Change user plan (admin)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
admin_users_id_plan_put_request = OpenapiClient::AdminUsersIdPlanPutRequest.new # AdminUsersIdPlanPutRequest | 

begin
  # Change user plan (admin)
  api_instance.admin_users_id_plan_put(id, admin_users_id_plan_put_request)
rescue OpenapiClient::ApiError => e
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
rescue OpenapiClient::ApiError => e
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
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AdminApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
admin_users_id_status_put_request = OpenapiClient::AdminUsersIdStatusPutRequest.new # AdminUsersIdStatusPutRequest | 

begin
  # Change user status (admin)
  api_instance.admin_users_id_status_put(id, admin_users_id_status_put_request)
rescue OpenapiClient::ApiError => e
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
rescue OpenapiClient::ApiError => e
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

