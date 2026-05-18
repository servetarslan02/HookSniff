# hooksniff.StreamApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**stream_deliveries_get**](StreamApi.md#stream_deliveries_get) | **GET** /stream/deliveries | Real-time delivery event stream (SSE)


# **stream_deliveries_get**
> str stream_deliveries_get(endpoint_id=endpoint_id, status=status, limit=limit)

Real-time delivery event stream (SSE)

Server-Sent Events stream of webhook deliveries

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
    api_instance = hooksniff.StreamApi(api_client)
    endpoint_id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID |  (optional)
    status = 'status_example' # str |  (optional)
    limit = 50 # int |  (optional) (default to 50)

    try:
        # Real-time delivery event stream (SSE)
        api_response = api_instance.stream_deliveries_get(endpoint_id=endpoint_id, status=status, limit=limit)
        print("The response of StreamApi->stream_deliveries_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling StreamApi->stream_deliveries_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **endpoint_id** | **UUID**|  | [optional] 
 **status** | **str**|  | [optional] 
 **limit** | **int**|  | [optional] [default to 50]

### Return type

**str**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/event-stream

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | SSE stream |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

