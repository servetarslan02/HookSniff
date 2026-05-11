# hooksniff.PlaygroundApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**playground_get**](PlaygroundApi.md#playground_get) | **GET** /playground | Get playground info (endpoints, sample payloads)
[**playground_test_post**](PlaygroundApi.md#playground_test_post) | **POST** /playground/test | Test a webhook delivery


# **playground_get**
> PlaygroundGet200Response playground_get()

Get playground info (endpoints, sample payloads)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.playground_get200_response import PlaygroundGet200Response
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
    api_instance = hooksniff.PlaygroundApi(api_client)

    try:
        # Get playground info (endpoints, sample payloads)
        api_response = api_instance.playground_get()
        print("The response of PlaygroundApi->playground_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling PlaygroundApi->playground_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**PlaygroundGet200Response**](PlaygroundGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Playground data |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **playground_test_post**
> TestWebhookResponse playground_test_post(test_webhook_request)

Test a webhook delivery

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.test_webhook_request import TestWebhookRequest
from hooksniff.models.test_webhook_response import TestWebhookResponse
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
    api_instance = hooksniff.PlaygroundApi(api_client)
    test_webhook_request = hooksniff.TestWebhookRequest() # TestWebhookRequest | 

    try:
        # Test a webhook delivery
        api_response = api_instance.playground_test_post(test_webhook_request)
        print("The response of PlaygroundApi->playground_test_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling PlaygroundApi->playground_test_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **test_webhook_request** | [**TestWebhookRequest**](TestWebhookRequest.md)|  | 

### Return type

[**TestWebhookResponse**](TestWebhookResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Test result |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

