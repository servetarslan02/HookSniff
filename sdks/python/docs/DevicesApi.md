# hooksniff.DevicesApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**devices_get**](DevicesApi.md#devices_get) | **GET** /devices | List registered devices
[**devices_post**](DevicesApi.md#devices_post) | **POST** /devices | Register device for push notifications
[**devices_token_delete**](DevicesApi.md#devices_token_delete) | **DELETE** /devices/{token} | Remove device token


# **devices_get**
> List[DeviceTokenResponse] devices_get()

List registered devices

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.device_token_response import DeviceTokenResponse
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
    api_instance = hooksniff.DevicesApi(api_client)

    try:
        # List registered devices
        api_response = api_instance.devices_get()
        print("The response of DevicesApi->devices_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DevicesApi->devices_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**List[DeviceTokenResponse]**](DeviceTokenResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Device list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devices_post**
> DeviceTokenResponse devices_post(register_device_request)

Register device for push notifications

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.device_token_response import DeviceTokenResponse
from hooksniff.models.register_device_request import RegisterDeviceRequest
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
    api_instance = hooksniff.DevicesApi(api_client)
    register_device_request = hooksniff.RegisterDeviceRequest() # RegisterDeviceRequest | 

    try:
        # Register device for push notifications
        api_response = api_instance.devices_post(register_device_request)
        print("The response of DevicesApi->devices_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DevicesApi->devices_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **register_device_request** | [**RegisterDeviceRequest**](RegisterDeviceRequest.md)|  | 

### Return type

[**DeviceTokenResponse**](DeviceTokenResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Device registered |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devices_token_delete**
> devices_token_delete(token)

Remove device token

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
    api_instance = hooksniff.DevicesApi(api_client)
    token = 'token_example' # str | 

    try:
        # Remove device token
        api_instance.devices_token_delete(token)
    except Exception as e:
        print("Exception when calling DevicesApi->devices_token_delete: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token** | **str**|  | 

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
**200** | Device removed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

