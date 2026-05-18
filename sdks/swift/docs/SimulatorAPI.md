# SimulatorAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**simulatorPost**](SimulatorAPI.md#simulatorpost) | **POST** /simulator | Simulate a webhook delivery


# **simulatorPost**
```swift
    open class func simulatorPost(simulatorPostRequest: SimulatorPostRequest? = nil, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Simulate a webhook delivery

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let simulatorPostRequest = _simulator_post_request(endpointId: "endpointId_example", event: "event_example", data: 123) // SimulatorPostRequest |  (optional)

// Simulate a webhook delivery
SimulatorAPI.simulatorPost(simulatorPostRequest: simulatorPostRequest) { (response, error) in
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
 **simulatorPostRequest** | [**SimulatorPostRequest**](SimulatorPostRequest.md) |  | [optional] 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

