# hooksniff.AdminApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**admin_alerts_get**](AdminApi.md#admin_alerts_get) | **GET** /admin/alerts | List all alert rules (admin)
[**admin_alerts_id_delete**](AdminApi.md#admin_alerts_id_delete) | **DELETE** /admin/alerts/{id} | Delete an alert rule (admin)
[**admin_alerts_id_put**](AdminApi.md#admin_alerts_id_put) | **PUT** /admin/alerts/{id} | Update an alert rule (admin)
[**admin_alerts_post**](AdminApi.md#admin_alerts_post) | **POST** /admin/alerts | Create a platform alert rule (admin)
[**admin_audit_logs_get**](AdminApi.md#admin_audit_logs_get) | **GET** /admin/audit-logs | List audit logs (admin)
[**admin_churn_get**](AdminApi.md#admin_churn_get) | **GET** /admin/churn | Get churn metrics (admin)
[**admin_deliveries_id_replay_post**](AdminApi.md#admin_deliveries_id_replay_post) | **POST** /admin/deliveries/{id}/replay | Replay a delivery (admin)
[**admin_deploy_info_get**](AdminApi.md#admin_deploy_info_get) | **GET** /admin/deploy-info | Get deploy info
[**admin_feature_flags_get**](AdminApi.md#admin_feature_flags_get) | **GET** /admin/feature-flags | List feature flags
[**admin_feature_flags_id_delete**](AdminApi.md#admin_feature_flags_id_delete) | **DELETE** /admin/feature-flags/{id} | Delete feature flag
[**admin_feature_flags_id_put**](AdminApi.md#admin_feature_flags_id_put) | **PUT** /admin/feature-flags/{id} | Update feature flag
[**admin_feature_flags_post**](AdminApi.md#admin_feature_flags_post) | **POST** /admin/feature-flags | Create feature flag
[**admin_revenue_export_get**](AdminApi.md#admin_revenue_export_get) | **GET** /admin/revenue/export | Export revenue data as CSV (admin)
[**admin_revenue_get**](AdminApi.md#admin_revenue_get) | **GET** /admin/revenue | Revenue analytics (admin)
[**admin_sdk_update_post**](AdminApi.md#admin_sdk_update_post) | **POST** /admin/sdk-update | Send SDK update notification to users
[**admin_settings_get**](AdminApi.md#admin_settings_get) | **GET** /admin/settings | Get platform settings (admin)
[**admin_settings_put**](AdminApi.md#admin_settings_put) | **PUT** /admin/settings | Update platform settings (admin)
[**admin_stats_get**](AdminApi.md#admin_stats_get) | **GET** /admin/stats | System-wide statistics (admin)
[**admin_test_webhook_post**](AdminApi.md#admin_test_webhook_post) | **POST** /admin/test-webhook | Send a test webhook to a URL (admin)
[**admin_users_export_get**](AdminApi.md#admin_users_export_get) | **GET** /admin/users/export | Export users as CSV (admin)
[**admin_users_get**](AdminApi.md#admin_users_get) | **GET** /admin/users | List all users (admin)
[**admin_users_id_analytics_get**](AdminApi.md#admin_users_id_analytics_get) | **GET** /admin/users/{id}/analytics | Get user analytics (admin)
[**admin_users_id_get**](AdminApi.md#admin_users_id_get) | **GET** /admin/users/{id} | Get user details (admin)
[**admin_users_id_plan_put**](AdminApi.md#admin_users_id_plan_put) | **PUT** /admin/users/{id}/plan | Change user plan (admin)
[**admin_users_id_status_put**](AdminApi.md#admin_users_id_status_put) | **PUT** /admin/users/{id}/status | Change user status (admin)


# **admin_alerts_get**
> List[AdminAlertRule] admin_alerts_get()

List all alert rules (admin)

Returns all alert rules for the authenticated admin's account

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_alert_rule import AdminAlertRule
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)

    try:
        # List all alert rules (admin)
        api_response = api_instance.admin_alerts_get()
        print("The response of AdminApi->admin_alerts_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_alerts_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**List[AdminAlertRule]**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | List of alert rules |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_alerts_id_delete**
> AdminAlertsIdDelete200Response admin_alerts_id_delete(id)

Delete an alert rule (admin)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_alerts_id_delete200_response import AdminAlertsIdDelete200Response
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Delete an alert rule (admin)
        api_response = api_instance.admin_alerts_id_delete(id)
        print("The response of AdminApi->admin_alerts_id_delete:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_alerts_id_delete: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 

### Return type

[**AdminAlertsIdDelete200Response**](AdminAlertsIdDelete200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Alert rule deleted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_alerts_id_put**
> AdminAlertRule admin_alerts_id_put(id, admin_update_alert_request=admin_update_alert_request)

Update an alert rule (admin)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_alert_rule import AdminAlertRule
from hooksniff.models.admin_update_alert_request import AdminUpdateAlertRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    admin_update_alert_request = hooksniff.AdminUpdateAlertRequest() # AdminUpdateAlertRequest |  (optional)

    try:
        # Update an alert rule (admin)
        api_response = api_instance.admin_alerts_id_put(id, admin_update_alert_request=admin_update_alert_request)
        print("The response of AdminApi->admin_alerts_id_put:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_alerts_id_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 
 **admin_update_alert_request** | [**AdminUpdateAlertRequest**](AdminUpdateAlertRequest.md)|  | [optional] 

### Return type

[**AdminAlertRule**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Alert rule updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_alerts_post**
> AdminAlertRule admin_alerts_post(admin_create_alert_request)

Create a platform alert rule (admin)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_alert_rule import AdminAlertRule
from hooksniff.models.admin_create_alert_request import AdminCreateAlertRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    admin_create_alert_request = hooksniff.AdminCreateAlertRequest() # AdminCreateAlertRequest | 

    try:
        # Create a platform alert rule (admin)
        api_response = api_instance.admin_alerts_post(admin_create_alert_request)
        print("The response of AdminApi->admin_alerts_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_alerts_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **admin_create_alert_request** | [**AdminCreateAlertRequest**](AdminCreateAlertRequest.md)|  | 

### Return type

[**AdminAlertRule**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Alert rule created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_audit_logs_get**
> AdminAuditLogResponse admin_audit_logs_get(page=page, per_page=per_page, action=action, admin_id=admin_id)

List audit logs (admin)

Returns all audit log entries across all users

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_audit_log_response import AdminAuditLogResponse
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    page = 1 # int |  (optional) (default to 1)
    per_page = 50 # int |  (optional) (default to 50)
    action = 'action_example' # str |  (optional)
    admin_id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID |  (optional)

    try:
        # List audit logs (admin)
        api_response = api_instance.admin_audit_logs_get(page=page, per_page=per_page, action=action, admin_id=admin_id)
        print("The response of AdminApi->admin_audit_logs_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_audit_logs_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **int**|  | [optional] [default to 1]
 **per_page** | **int**|  | [optional] [default to 50]
 **action** | **str**|  | [optional] 
 **admin_id** | **UUID**|  | [optional] 

### Return type

[**AdminAuditLogResponse**](AdminAuditLogResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Paginated audit log entries |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_churn_get**
> ChurnResponse admin_churn_get()

Get churn metrics (admin)

Lists users who became inactive in the last 30 days

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.churn_response import ChurnResponse
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)

    try:
        # Get churn metrics (admin)
        api_response = api_instance.admin_churn_get()
        print("The response of AdminApi->admin_churn_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_churn_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Churn report |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_deliveries_id_replay_post**
> ReplayDeliveryResponse admin_deliveries_id_replay_post(id)

Replay a delivery (admin)

Creates a new delivery with the same payload as the original

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.replay_delivery_response import ReplayDeliveryResponse
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | Original delivery ID to replay

    try:
        # Replay a delivery (admin)
        api_response = api_instance.admin_deliveries_id_replay_post(id)
        print("The response of AdminApi->admin_deliveries_id_replay_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_deliveries_id_replay_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**| Original delivery ID to replay | 

### Return type

[**ReplayDeliveryResponse**](ReplayDeliveryResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Delivery replayed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_deploy_info_get**
> DeployInfo admin_deploy_info_get()

Get deploy info

Admin-only. Returns current deployment version and build info.

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.deploy_info import DeployInfo
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)

    try:
        # Get deploy info
        api_response = api_instance.admin_deploy_info_get()
        print("The response of AdminApi->admin_deploy_info_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_deploy_info_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Deploy info |  -  |
**401** |  |  -  |
**403** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_feature_flags_get**
> AdminFeatureFlagsGet200Response admin_feature_flags_get()

List feature flags

Admin-only. Returns all feature flags.

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_feature_flags_get200_response import AdminFeatureFlagsGet200Response
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)

    try:
        # List feature flags
        api_response = api_instance.admin_feature_flags_get()
        print("The response of AdminApi->admin_feature_flags_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_feature_flags_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Feature flags |  -  |
**401** |  |  -  |
**403** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_feature_flags_id_delete**
> admin_feature_flags_id_delete(id)

Delete feature flag

Admin-only. Deletes a feature flag.

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Delete feature flag
        api_instance.admin_feature_flags_id_delete(id)
    except Exception as e:
        print("Exception when calling AdminApi->admin_feature_flags_id_delete: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Feature flag deleted |  -  |
**404** |  |  -  |
**403** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_feature_flags_id_put**
> FeatureFlag admin_feature_flags_id_put(id, admin_feature_flags_id_put_request=admin_feature_flags_id_put_request)

Update feature flag

Admin-only. Updates a feature flag.

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_feature_flags_id_put_request import AdminFeatureFlagsIdPutRequest
from hooksniff.models.feature_flag import FeatureFlag
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    admin_feature_flags_id_put_request = hooksniff.AdminFeatureFlagsIdPutRequest() # AdminFeatureFlagsIdPutRequest |  (optional)

    try:
        # Update feature flag
        api_response = api_instance.admin_feature_flags_id_put(id, admin_feature_flags_id_put_request=admin_feature_flags_id_put_request)
        print("The response of AdminApi->admin_feature_flags_id_put:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_feature_flags_id_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 
 **admin_feature_flags_id_put_request** | [**AdminFeatureFlagsIdPutRequest**](AdminFeatureFlagsIdPutRequest.md)|  | [optional] 

### Return type

[**FeatureFlag**](FeatureFlag.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Feature flag updated |  -  |
**404** |  |  -  |
**403** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_feature_flags_post**
> FeatureFlag admin_feature_flags_post(admin_feature_flags_post_request)

Create feature flag

Admin-only. Creates a new feature flag.

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_feature_flags_post_request import AdminFeatureFlagsPostRequest
from hooksniff.models.feature_flag import FeatureFlag
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    admin_feature_flags_post_request = hooksniff.AdminFeatureFlagsPostRequest() # AdminFeatureFlagsPostRequest | 

    try:
        # Create feature flag
        api_response = api_instance.admin_feature_flags_post(admin_feature_flags_post_request)
        print("The response of AdminApi->admin_feature_flags_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_feature_flags_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **admin_feature_flags_post_request** | [**AdminFeatureFlagsPostRequest**](AdminFeatureFlagsPostRequest.md)|  | 

### Return type

[**FeatureFlag**](FeatureFlag.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Feature flag created |  -  |
**400** | Validation error |  -  |
**403** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_revenue_export_get**
> str admin_revenue_export_get(format=format, months=months)

Export revenue data as CSV (admin)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    format = csv # str |  (optional) (default to csv)
    months = 12 # int | Number of months to include (optional) (default to 12)

    try:
        # Export revenue data as CSV (admin)
        api_response = api_instance.admin_revenue_export_get(format=format, months=months)
        print("The response of AdminApi->admin_revenue_export_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_revenue_export_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **format** | **str**|  | [optional] [default to csv]
 **months** | **int**| Number of months to include | [optional] [default to 12]

### Return type

**str**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/csv

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Revenue CSV export |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_revenue_get**
> RevenueResponse admin_revenue_get()

Revenue analytics (admin)

Returns monthly revenue, revenue by plan, MRR, churn rate, and MRR trend

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.revenue_response import RevenueResponse
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)

    try:
        # Revenue analytics (admin)
        api_response = api_instance.admin_revenue_get()
        print("The response of AdminApi->admin_revenue_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_revenue_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Revenue data |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_sdk_update_post**
> admin_sdk_update_post(admin_sdk_update_post_request=admin_sdk_update_post_request)

Send SDK update notification to users

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_sdk_update_post_request import AdminSdkUpdatePostRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    admin_sdk_update_post_request = hooksniff.AdminSdkUpdatePostRequest() # AdminSdkUpdatePostRequest |  (optional)

    try:
        # Send SDK update notification to users
        api_instance.admin_sdk_update_post(admin_sdk_update_post_request=admin_sdk_update_post_request)
    except Exception as e:
        print("Exception when calling AdminApi->admin_sdk_update_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **admin_sdk_update_post_request** | [**AdminSdkUpdatePostRequest**](AdminSdkUpdatePostRequest.md)|  | [optional] 

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Notification sent |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_settings_get**
> PlatformSettings admin_settings_get()

Get platform settings (admin)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.platform_settings import PlatformSettings
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)

    try:
        # Get platform settings (admin)
        api_response = api_instance.admin_settings_get()
        print("The response of AdminApi->admin_settings_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_settings_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Platform settings |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_settings_put**
> AdminSettingsPut200Response admin_settings_put(platform_settings)

Update platform settings (admin)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_settings_put200_response import AdminSettingsPut200Response
from hooksniff.models.platform_settings import PlatformSettings
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    platform_settings = hooksniff.PlatformSettings() # PlatformSettings | 

    try:
        # Update platform settings (admin)
        api_response = api_instance.admin_settings_put(platform_settings)
        print("The response of AdminApi->admin_settings_put:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_settings_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **platform_settings** | [**PlatformSettings**](PlatformSettings.md)|  | 

### Return type

[**AdminSettingsPut200Response**](AdminSettingsPut200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Settings updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_stats_get**
> SystemStats admin_stats_get()

System-wide statistics (admin)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.system_stats import SystemStats
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)

    try:
        # System-wide statistics (admin)
        api_response = api_instance.admin_stats_get()
        print("The response of AdminApi->admin_stats_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_stats_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | System stats |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_test_webhook_post**
> AdminTestWebhookResponse admin_test_webhook_post(admin_test_webhook_request)

Send a test webhook to a URL (admin)

Sends an HTTP POST to the specified URL with SSRF protection

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_test_webhook_request import AdminTestWebhookRequest
from hooksniff.models.admin_test_webhook_response import AdminTestWebhookResponse
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    admin_test_webhook_request = hooksniff.AdminTestWebhookRequest() # AdminTestWebhookRequest | 

    try:
        # Send a test webhook to a URL (admin)
        api_response = api_instance.admin_test_webhook_post(admin_test_webhook_request)
        print("The response of AdminApi->admin_test_webhook_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_test_webhook_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **admin_test_webhook_request** | [**AdminTestWebhookRequest**](AdminTestWebhookRequest.md)|  | 

### Return type

[**AdminTestWebhookResponse**](AdminTestWebhookResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Test webhook result |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_users_export_get**
> str admin_users_export_get(format=format, plan=plan, status=status)

Export users as CSV (admin)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    format = csv # str |  (optional) (default to csv)
    plan = 'plan_example' # str | Filter by plan (optional)
    status = 'status_example' # str | Filter by status (optional)

    try:
        # Export users as CSV (admin)
        api_response = api_instance.admin_users_export_get(format=format, plan=plan, status=status)
        print("The response of AdminApi->admin_users_export_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_users_export_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **format** | **str**|  | [optional] [default to csv]
 **plan** | **str**| Filter by plan | [optional] 
 **status** | **str**| Filter by status | [optional] 

### Return type

**str**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/csv

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Users CSV export |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_users_get**
> PaginatedUsers admin_users_get(page=page, per_page=per_page, search=search, plan=plan, status=status, created_after=created_after, created_before=created_before)

List all users (admin)

Returns paginated list of users with optional filters

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.paginated_users import PaginatedUsers
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    page = 1 # int |  (optional) (default to 1)
    per_page = 20 # int |  (optional) (default to 20)
    search = 'search_example' # str | Search by email or name (ILIKE) (optional)
    plan = 'plan_example' # str | Filter by plan (optional)
    status = 'status_example' # str | Filter by status (optional)
    created_after = '2013-10-20' # date | Filter users created after this date (ISO 8601) (optional)
    created_before = '2013-10-20' # date | Filter users created before this date (ISO 8601) (optional)

    try:
        # List all users (admin)
        api_response = api_instance.admin_users_get(page=page, per_page=per_page, search=search, plan=plan, status=status, created_after=created_after, created_before=created_before)
        print("The response of AdminApi->admin_users_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_users_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **int**|  | [optional] [default to 1]
 **per_page** | **int**|  | [optional] [default to 20]
 **search** | **str**| Search by email or name (ILIKE) | [optional] 
 **plan** | **str**| Filter by plan | [optional] 
 **status** | **str**| Filter by status | [optional] 
 **created_after** | **date**| Filter users created after this date (ISO 8601) | [optional] 
 **created_before** | **date**| Filter users created before this date (ISO 8601) | [optional] 

### Return type

[**PaginatedUsers**](PaginatedUsers.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Paginated user list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_users_id_analytics_get**
> UserAnalytics admin_users_id_analytics_get(id, days=days)

Get user analytics (admin)

Returns delivery analytics for a specific user over a time period

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.user_analytics import UserAnalytics
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    days = 30 # int | Number of days to analyze (optional) (default to 30)

    try:
        # Get user analytics (admin)
        api_response = api_instance.admin_users_id_analytics_get(id, days=days)
        print("The response of AdminApi->admin_users_id_analytics_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_users_id_analytics_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 
 **days** | **int**| Number of days to analyze | [optional] [default to 30]

### Return type

[**UserAnalytics**](UserAnalytics.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | User analytics data |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_users_id_get**
> AdminUsersIdGet200Response admin_users_id_get(id)

Get user details (admin)

Returns user details with endpoints, recent deliveries, and usage stats

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_users_id_get200_response import AdminUsersIdGet200Response
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Get user details (admin)
        api_response = api_instance.admin_users_id_get(id)
        print("The response of AdminApi->admin_users_id_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_users_id_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 

### Return type

[**AdminUsersIdGet200Response**](AdminUsersIdGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | User details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_users_id_plan_put**
> admin_users_id_plan_put(id, admin_users_id_plan_put_request)

Change user plan (admin)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_users_id_plan_put_request import AdminUsersIdPlanPutRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    admin_users_id_plan_put_request = hooksniff.AdminUsersIdPlanPutRequest() # AdminUsersIdPlanPutRequest | 

    try:
        # Change user plan (admin)
        api_instance.admin_users_id_plan_put(id, admin_users_id_plan_put_request)
    except Exception as e:
        print("Exception when calling AdminApi->admin_users_id_plan_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 
 **admin_users_id_plan_put_request** | [**AdminUsersIdPlanPutRequest**](AdminUsersIdPlanPutRequest.md)|  | 

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Plan changed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **admin_users_id_status_put**
> admin_users_id_status_put(id, admin_users_id_status_put_request)

Change user status (admin)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_users_id_status_put_request import AdminUsersIdStatusPutRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AdminApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    admin_users_id_status_put_request = hooksniff.AdminUsersIdStatusPutRequest() # AdminUsersIdStatusPutRequest | 

    try:
        # Change user status (admin)
        api_instance.admin_users_id_status_put(id, admin_users_id_status_put_request)
    except Exception as e:
        print("Exception when calling AdminApi->admin_users_id_status_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 
 **admin_users_id_status_put_request** | [**AdminUsersIdStatusPutRequest**](AdminUsersIdStatusPutRequest.md)|  | 

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Status changed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

