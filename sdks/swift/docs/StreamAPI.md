# StreamAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**streamDeliveriesGet**](StreamAPI.md#streamdeliveriesget) | **GET** /stream/deliveries | Real-time delivery event stream (SSE)


# **streamDeliveriesGet**
```swift
    open class func streamDeliveriesGet(endpointId: UUID? = nil, status: String? = nil, limit: Int? = nil, completion: @escaping (_ data: String?, _ error: Error?) -> Void)
```

Real-time delivery event stream (SSE)

Server-Sent Events stream of webhook deliveries

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let endpointId = 987 // UUID |  (optional)
let status = "status_example" // String |  (optional)
let limit = 987 // Int |  (optional) (default to 50)

// Real-time delivery event stream (SSE)
StreamAPI.streamDeliveriesGet(endpointId: endpointId, status: status, limit: limit) { (response, error) in
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

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **endpointId** | **UUID** |  | [optional] 
 **status** | **String** |  | [optional] 
 **limit** | **Int** |  | [optional] [default to 50]

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/event-stream

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

