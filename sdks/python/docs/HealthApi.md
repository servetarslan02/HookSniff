# hooksniff.HealthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**endpoint_health_get**](HealthApi.md#endpoint_health_get) | **GET** /endpoint-health | List endpoint health statuses
[**endpoint_health_id_get**](HealthApi.md#endpoint_health_id_get) | **GET** /endpoint-health/{id} | Get specific endpoint health
[**status_get**](HealthApi.md#status_get) | **GET** /status | System status (public)


# **endpoint_health_get**
> List[EndpointHealth] endpoint_health_get()

List endpoint health statuses

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.endpoint_health import EndpointHealth
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
    api_instance = hooksniff.HealthApi(api_client)

    try:
        # List endpoint health statuses
        api_response = api_instance.endpoint_health_get()
        print("The response of HealthApi->endpoint_health_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling HealthApi->endpoint_health_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**List[EndpointHealth]**](EndpointHealth.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Health list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpoint_health_id_get**
> EndpointHealth endpoint_health_id_get(id)

Get specific endpoint health

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.endpoint_health import EndpointHealth
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
    api_instance = hooksniff.HealthApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Get specific endpoint health
        api_response = api_instance.endpoint_health_id_get(id)
        print("The response of HealthApi->endpoint_health_id_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling HealthApi->endpoint_health_id_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 

### Return type

[**EndpointHealth**](EndpointHealth.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Health status |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **status_get**
> SystemStatus status_get()

System status (public)

### Example


```python
import hooksniff
from hooksniff.models.system_status import SystemStatus
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)


# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.HealthApi(api_client)

    try:
        # System status (public)
        api_response = api_instance.status_get()
        print("The response of HealthApi->status_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling HealthApi->status_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**SystemStatus**](SystemStatus.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | System operational |  -  |
**503** | System degraded or down |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

