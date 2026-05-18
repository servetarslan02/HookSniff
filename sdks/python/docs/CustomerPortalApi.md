# hooksniff.CustomerPortalApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**portal_api_keys_get**](CustomerPortalApi.md#portal_api_keys_get) | **GET** /portal/api-keys | List API keys (portal)
[**portal_api_keys_key_id_delete**](CustomerPortalApi.md#portal_api_keys_key_id_delete) | **DELETE** /portal/api-keys/{key_id} | Revoke API key (portal)
[**portal_api_keys_post**](CustomerPortalApi.md#portal_api_keys_post) | **POST** /portal/api-keys | Create API key (portal)
[**portal_config_get**](CustomerPortalApi.md#portal_config_get) | **GET** /portal/config | Get portal configuration
[**portal_config_post**](CustomerPortalApi.md#portal_config_post) | **POST** /portal/config | Update portal configuration
[**portal_embed_code_get**](CustomerPortalApi.md#portal_embed_code_get) | **GET** /portal/embed-code | Get portal embed code
[**portal_me_get**](CustomerPortalApi.md#portal_me_get) | **GET** /portal/me | Get portal profile
[**portal_me_put**](CustomerPortalApi.md#portal_me_put) | **PUT** /portal/me | Update portal profile
[**portal_notifications_get**](CustomerPortalApi.md#portal_notifications_get) | **GET** /portal/notifications | Get notification preferences (portal)
[**portal_notifications_put**](CustomerPortalApi.md#portal_notifications_put) | **PUT** /portal/notifications | Update notification preferences (portal)
[**portal_plan_get**](CustomerPortalApi.md#portal_plan_get) | **GET** /portal/plan | Get plan info (portal)
[**portal_usage_get**](CustomerPortalApi.md#portal_usage_get) | **GET** /portal/usage | Get usage (portal)


# **portal_api_keys_get**
> List[ApiKeyInfo] portal_api_keys_get()

List API keys (portal)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.api_key_info import ApiKeyInfo
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
    api_instance = hooksniff.CustomerPortalApi(api_client)

    try:
        # List API keys (portal)
        api_response = api_instance.portal_api_keys_get()
        print("The response of CustomerPortalApi->portal_api_keys_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CustomerPortalApi->portal_api_keys_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**List[ApiKeyInfo]**](ApiKeyInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | API key list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portal_api_keys_key_id_delete**
> portal_api_keys_key_id_delete(key_id)

Revoke API key (portal)

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
    api_instance = hooksniff.CustomerPortalApi(api_client)
    key_id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Revoke API key (portal)
        api_instance.portal_api_keys_key_id_delete(key_id)
    except Exception as e:
        print("Exception when calling CustomerPortalApi->portal_api_keys_key_id_delete: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **key_id** | **UUID**|  | 

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
**200** | Key revoked |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portal_api_keys_post**
> CreateApiKeyResponse portal_api_keys_post()

Create API key (portal)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.create_api_key_response import CreateApiKeyResponse
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
    api_instance = hooksniff.CustomerPortalApi(api_client)

    try:
        # Create API key (portal)
        api_response = api_instance.portal_api_keys_post()
        print("The response of CustomerPortalApi->portal_api_keys_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CustomerPortalApi->portal_api_keys_post: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | API key created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portal_config_get**
> portal_config_get()

Get portal configuration

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
    api_instance = hooksniff.CustomerPortalApi(api_client)

    try:
        # Get portal configuration
        api_instance.portal_config_get()
    except Exception as e:
        print("Exception when calling CustomerPortalApi->portal_config_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

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
**200** | Portal config |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portal_config_post**
> portal_config_post()

Update portal configuration

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
    api_instance = hooksniff.CustomerPortalApi(api_client)

    try:
        # Update portal configuration
        api_instance.portal_config_post()
    except Exception as e:
        print("Exception when calling CustomerPortalApi->portal_config_post: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

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
**200** | Portal config saved |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portal_embed_code_get**
> portal_embed_code_get()

Get portal embed code

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
    api_instance = hooksniff.CustomerPortalApi(api_client)

    try:
        # Get portal embed code
        api_instance.portal_embed_code_get()
    except Exception as e:
        print("Exception when calling CustomerPortalApi->portal_embed_code_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

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
**200** | Embed code snippet |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portal_me_get**
> PortalProfile portal_me_get()

Get portal profile

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.portal_profile import PortalProfile
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
    api_instance = hooksniff.CustomerPortalApi(api_client)

    try:
        # Get portal profile
        api_response = api_instance.portal_me_get()
        print("The response of CustomerPortalApi->portal_me_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CustomerPortalApi->portal_me_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Profile |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portal_me_put**
> portal_me_put(update_profile_request)

Update portal profile

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.update_profile_request import UpdateProfileRequest
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
    api_instance = hooksniff.CustomerPortalApi(api_client)
    update_profile_request = hooksniff.UpdateProfileRequest() # UpdateProfileRequest | 

    try:
        # Update portal profile
        api_instance.portal_me_put(update_profile_request)
    except Exception as e:
        print("Exception when calling CustomerPortalApi->portal_me_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **update_profile_request** | [**UpdateProfileRequest**](UpdateProfileRequest.md)|  | 

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
**200** | Profile updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portal_notifications_get**
> NotificationPreferences portal_notifications_get()

Get notification preferences (portal)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.notification_preferences import NotificationPreferences
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
    api_instance = hooksniff.CustomerPortalApi(api_client)

    try:
        # Get notification preferences (portal)
        api_response = api_instance.portal_notifications_get()
        print("The response of CustomerPortalApi->portal_notifications_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CustomerPortalApi->portal_notifications_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Notification preferences |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portal_notifications_put**
> PortalNotificationsPut200Response portal_notifications_put(update_notification_preferences)

Update notification preferences (portal)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.portal_notifications_put200_response import PortalNotificationsPut200Response
from hooksniff.models.update_notification_preferences import UpdateNotificationPreferences
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
    api_instance = hooksniff.CustomerPortalApi(api_client)
    update_notification_preferences = hooksniff.UpdateNotificationPreferences() # UpdateNotificationPreferences | 

    try:
        # Update notification preferences (portal)
        api_response = api_instance.portal_notifications_put(update_notification_preferences)
        print("The response of CustomerPortalApi->portal_notifications_put:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CustomerPortalApi->portal_notifications_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **update_notification_preferences** | [**UpdateNotificationPreferences**](UpdateNotificationPreferences.md)|  | 

### Return type

[**PortalNotificationsPut200Response**](PortalNotificationsPut200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Preferences updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portal_plan_get**
> SubscriptionResponse portal_plan_get()

Get plan info (portal)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.subscription_response import SubscriptionResponse
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
    api_instance = hooksniff.CustomerPortalApi(api_client)

    try:
        # Get plan info (portal)
        api_response = api_instance.portal_plan_get()
        print("The response of CustomerPortalApi->portal_plan_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CustomerPortalApi->portal_plan_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Plan details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portal_usage_get**
> UsageResponse portal_usage_get()

Get usage (portal)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.usage_response import UsageResponse
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
    api_instance = hooksniff.CustomerPortalApi(api_client)

    try:
        # Get usage (portal)
        api_response = api_instance.portal_usage_get()
        print("The response of CustomerPortalApi->portal_usage_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CustomerPortalApi->portal_usage_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Usage data |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

