# hooksniff.SimulatorApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**simulator_post**](SimulatorApi.md#simulator_post) | **POST** /simulator | Simulate a webhook delivery


# **simulator_post**
> simulator_post(simulator_post_request=simulator_post_request)

Simulate a webhook delivery

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.simulator_post_request import SimulatorPostRequest
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
    api_instance = hooksniff.SimulatorApi(api_client)
    simulator_post_request = hooksniff.SimulatorPostRequest() # SimulatorPostRequest |  (optional)

    try:
        # Simulate a webhook delivery
        api_instance.simulator_post(simulator_post_request=simulator_post_request)
    except Exception as e:
        print("Exception when calling SimulatorApi->simulator_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **simulator_post_request** | [**SimulatorPostRequest**](SimulatorPostRequest.md)|  | [optional] 

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
**200** | Simulation result |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

