# hooksniff.AdminApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**admin_revenue_get**](AdminApi.md#admin_revenue_get) | **GET** /admin/revenue | Revenue by month (admin)
[**admin_sdk_update_post**](AdminApi.md#admin_sdk_update_post) | **POST** /admin/sdk-update | Send SDK update notification to users
[**admin_stats_get**](AdminApi.md#admin_stats_get) | **GET** /admin/stats | System-wide statistics (admin)
[**admin_users_get**](AdminApi.md#admin_users_get) | **GET** /admin/users | List all users (admin)
[**admin_users_id_get**](AdminApi.md#admin_users_id_get) | **GET** /admin/users/{id} | Get user details (admin)
[**admin_users_id_plan_put**](AdminApi.md#admin_users_id_plan_put) | **PUT** /admin/users/{id}/plan | Change user plan (admin)
[**admin_users_id_status_put**](AdminApi.md#admin_users_id_status_put) | **PUT** /admin/users/{id}/status | Change user status (admin)


# **admin_revenue_get**
> List[AdminRevenueGet200ResponseInner] admin_revenue_get()

Revenue by month (admin)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.admin_revenue_get200_response_inner import AdminRevenueGet200ResponseInner
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
        # Revenue by month (admin)
        api_response = api_instance.admin_revenue_get()
        print("The response of AdminApi->admin_revenue_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_revenue_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**List[AdminRevenueGet200ResponseInner]**](AdminRevenueGet200ResponseInner.md)

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

# **admin_users_get**
> PaginatedUsers admin_users_get(page=page, per_page=per_page)

List all users (admin)

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
    page = 56 # int |  (optional)
    per_page = 56 # int |  (optional)

    try:
        # List all users (admin)
        api_response = api_instance.admin_users_get(page=page, per_page=per_page)
        print("The response of AdminApi->admin_users_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AdminApi->admin_users_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **int**|  | [optional] 
 **per_page** | **int**|  | [optional] 

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

# **admin_users_id_get**
> admin_users_id_get(id)

Get user details (admin)

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
        # Get user details (admin)
        api_instance.admin_users_id_get(id)
    except Exception as e:
        print("Exception when calling AdminApi->admin_users_id_get: %s\n" % e)
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

