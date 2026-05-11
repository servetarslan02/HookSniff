# hooksniff.OutboundIPsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**outbound_ips_get**](OutboundIPsApi.md#outbound_ips_get) | **GET** /outbound-ips | Get outbound IP addresses for firewall whitelisting


# **outbound_ips_get**
> OutboundIpsResponse outbound_ips_get()

Get outbound IP addresses for firewall whitelisting

### Example


```python
import hooksniff
from hooksniff.models.outbound_ips_response import OutboundIpsResponse
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
    api_instance = hooksniff.OutboundIPsApi(api_client)

    try:
        # Get outbound IP addresses for firewall whitelisting
        api_response = api_instance.outbound_ips_get()
        print("The response of OutboundIPsApi->outbound_ips_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling OutboundIPsApi->outbound_ips_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**OutboundIpsResponse**](OutboundIpsResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | IP list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

