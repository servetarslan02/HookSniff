# hooksniff.DeliveryDetailsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**webhooks_id_attempts_attempt_id_get**](DeliveryDetailsApi.md#webhooks_id_attempts_attempt_id_get) | **GET** /webhooks/{id}/attempts/{attempt_id} | Get specific attempt detail
[**webhooks_id_details_get**](DeliveryDetailsApi.md#webhooks_id_details_get) | **GET** /webhooks/{id}/details | Get detailed delivery info


# **webhooks_id_attempts_attempt_id_get**
> webhooks_id_attempts_attempt_id_get(id, attempt_id)

Get specific attempt detail

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
    api_instance = hooksniff.DeliveryDetailsApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    attempt_id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Get specific attempt detail
        api_instance.webhooks_id_attempts_attempt_id_get(id, attempt_id)
    except Exception as e:
        print("Exception when calling DeliveryDetailsApi->webhooks_id_attempts_attempt_id_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 
 **attempt_id** | **UUID**|  | 

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
**200** | Attempt details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **webhooks_id_details_get**
> webhooks_id_details_get(id)

Get detailed delivery info

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
    api_instance = hooksniff.DeliveryDetailsApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Get detailed delivery info
        api_instance.webhooks_id_details_get(id)
    except Exception as e:
        print("Exception when calling DeliveryDetailsApi->webhooks_id_details_get: %s\n" % e)
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
**200** | Full delivery details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

