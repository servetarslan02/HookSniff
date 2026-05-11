# hooksniff.SearchApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**search_get**](SearchApi.md#search_get) | **GET** /search | Search deliveries


# **search_get**
> SearchResult search_get(q, status=status, endpoint_id=endpoint_id, page=page, per_page=per_page)

Search deliveries

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.search_result import SearchResult
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
    api_instance = hooksniff.SearchApi(api_client)
    q = 'q_example' # str | 
    status = 'status_example' # str |  (optional)
    endpoint_id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID |  (optional)
    page = 56 # int |  (optional)
    per_page = 56 # int |  (optional)

    try:
        # Search deliveries
        api_response = api_instance.search_get(q, status=status, endpoint_id=endpoint_id, page=page, per_page=per_page)
        print("The response of SearchApi->search_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SearchApi->search_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **q** | **str**|  | 
 **status** | **str**|  | [optional] 
 **endpoint_id** | **UUID**|  | [optional] 
 **page** | **int**|  | [optional] 
 **per_page** | **int**|  | [optional] 

### Return type

[**SearchResult**](SearchResult.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Search results |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

