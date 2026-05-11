# EventsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**eventsGet**](EventsAPI.md#eventsget) | **GET** /events | List event types


# **eventsGet**
```swift
    open class func eventsGet(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

List event types

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List event types
EventsAPI.eventsGet() { (response, error) in
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

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

