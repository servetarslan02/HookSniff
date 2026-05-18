# DeliveryDetailsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**webhooksIdAttemptsAttemptIdGet**](DeliveryDetailsAPI.md#webhooksidattemptsattemptidget) | **GET** /webhooks/{id}/attempts/{attempt_id} | Get specific attempt detail
[**webhooksIdDetailsGet**](DeliveryDetailsAPI.md#webhooksiddetailsget) | **GET** /webhooks/{id}/details | Get detailed delivery info


# **webhooksIdAttemptsAttemptIdGet**
```swift
    open class func webhooksIdAttemptsAttemptIdGet(id: UUID, attemptId: UUID, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Get specific attempt detail

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let attemptId = 987 // UUID | 

// Get specific attempt detail
DeliveryDetailsAPI.webhooksIdAttemptsAttemptIdGet(id: id, attemptId: attemptId) { (response, error) in
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
 **id** | **UUID** |  | 
 **attemptId** | **UUID** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **webhooksIdDetailsGet**
```swift
    open class func webhooksIdDetailsGet(id: UUID, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Get detailed delivery info

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Get detailed delivery info
DeliveryDetailsAPI.webhooksIdDetailsGet(id: id) { (response, error) in
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
 **id** | **UUID** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

