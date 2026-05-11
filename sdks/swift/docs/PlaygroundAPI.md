# PlaygroundAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**playgroundGet**](PlaygroundAPI.md#playgroundget) | **GET** /playground | Get playground info (endpoints, sample payloads)
[**playgroundTestPost**](PlaygroundAPI.md#playgroundtestpost) | **POST** /playground/test | Test a webhook delivery


# **playgroundGet**
```swift
    open class func playgroundGet(completion: @escaping (_ data: PlaygroundGet200Response?, _ error: Error?) -> Void)
```

Get playground info (endpoints, sample payloads)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get playground info (endpoints, sample payloads)
PlaygroundAPI.playgroundGet() { (response, error) in
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

[**PlaygroundGet200Response**](PlaygroundGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **playgroundTestPost**
```swift
    open class func playgroundTestPost(testWebhookRequest: TestWebhookRequest, completion: @escaping (_ data: TestWebhookResponse?, _ error: Error?) -> Void)
```

Test a webhook delivery

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let testWebhookRequest = TestWebhookRequest(endpointId: 123, payload: 123, event: "event_example") // TestWebhookRequest | 

// Test a webhook delivery
PlaygroundAPI.playgroundTestPost(testWebhookRequest: testWebhookRequest) { (response, error) in
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
 **testWebhookRequest** | [**TestWebhookRequest**](TestWebhookRequest.md) |  | 

### Return type

[**TestWebhookResponse**](TestWebhookResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

