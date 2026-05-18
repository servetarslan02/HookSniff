# hooksniff.RoutingApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**endpoints_id_health_get**](RoutingApi.md#endpoints_id_health_get) | **GET** /endpoints/{id}/health | Get endpoint health status
[**endpoints_id_routing_get**](RoutingApi.md#endpoints_id_routing_get) | **GET** /endpoints/{id}/routing | Get routing config for endpoint
[**endpoints_id_routing_put**](RoutingApi.md#endpoints_id_routing_put) | **PUT** /endpoints/{id}/routing | Update routing config


# **endpoints_id_health_get**
> EndpointHealth endpoints_id_health_get(id)

Get endpoint health status

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
    api_instance = hooksniff.RoutingApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Get endpoint health status
        api_response = api_instance.endpoints_id_health_get(id)
        print("The response of RoutingApi->endpoints_id_health_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling RoutingApi->endpoints_id_health_get: %s\n" % e)
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

# **endpoints_id_routing_get**
> RoutingInfo endpoints_id_routing_get(id)

Get routing config for endpoint

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.routing_info import RoutingInfo
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
    api_instance = hooksniff.RoutingApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Get routing config for endpoint
        api_response = api_instance.endpoints_id_routing_get(id)
        print("The response of RoutingApi->endpoints_id_routing_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling RoutingApi->endpoints_id_routing_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 

### Return type

[**RoutingInfo**](RoutingInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Routing info |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpoints_id_routing_put**
> RoutingInfo endpoints_id_routing_put(id, update_routing_request)

Update routing config

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.routing_info import RoutingInfo
from hooksniff.models.update_routing_request import UpdateRoutingRequest
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
    api_instance = hooksniff.RoutingApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    update_routing_request = hooksniff.UpdateRoutingRequest() # UpdateRoutingRequest | 

    try:
        # Update routing config
        api_response = api_instance.endpoints_id_routing_put(id, update_routing_request)
        print("The response of RoutingApi->endpoints_id_routing_put:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling RoutingApi->endpoints_id_routing_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 
 **update_routing_request** | [**UpdateRoutingRequest**](UpdateRoutingRequest.md)|  | 

### Return type

[**RoutingInfo**](RoutingInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Routing updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

