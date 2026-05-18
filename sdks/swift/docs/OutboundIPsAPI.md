# OutboundIPsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**outboundIpsGet**](OutboundIPsAPI.md#outboundipsget) | **GET** /outbound-ips | Get outbound IP addresses for firewall whitelisting


# **outboundIpsGet**
```swift
    open class func outboundIpsGet(completion: @escaping (_ data: OutboundIpsResponse?, _ error: Error?) -> Void)
```

Get outbound IP addresses for firewall whitelisting

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get outbound IP addresses for firewall whitelisting
OutboundIPsAPI.outboundIpsGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

