# hooksniff.ContactApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**contact_post**](ContactApi.md#contact_post) | **POST** /contact | Send contact form message


# **contact_post**
> ContactResponse contact_post(contact_request)

Send contact form message

### Example


```python
import hooksniff
from hooksniff.models.contact_request import ContactRequest
from hooksniff.models.contact_response import ContactResponse
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
    api_instance = hooksniff.ContactApi(api_client)
    contact_request = hooksniff.ContactRequest() # ContactRequest | 

    try:
        # Send contact form message
        api_response = api_instance.contact_post(contact_request)
        print("The response of ContactApi->contact_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ContactApi->contact_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **contact_request** | [**ContactRequest**](ContactRequest.md)|  | 

### Return type

[**ContactResponse**](ContactResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Message sent |  -  |
**400** | Validation error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

