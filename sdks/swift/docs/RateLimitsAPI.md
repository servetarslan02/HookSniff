# RateLimitsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**rateLimitsEndpointIdDelete**](RateLimitsAPI.md#ratelimitsendpointiddelete) | **DELETE** /rate-limits/{endpoint_id} | Delete rate limit for endpoint
[**rateLimitsEndpointIdGet**](RateLimitsAPI.md#ratelimitsendpointidget) | **GET** /rate-limits/{endpoint_id} | Get rate limit for endpoint
[**rateLimitsEndpointIdPost**](RateLimitsAPI.md#ratelimitsendpointidpost) | **POST** /rate-limits/{endpoint_id} | Set rate limit for endpoint
[**rateLimitsGet**](RateLimitsAPI.md#ratelimitsget) | **GET** /rate-limits | List rate limits


# **rateLimitsEndpointIdDelete**
```swift
    open class func rateLimitsEndpointIdDelete(endpointId: String, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Delete rate limit for endpoint

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let endpointId = "endpointId_example" // String | 

// Delete rate limit for endpoint
RateLimitsAPI.rateLimitsEndpointIdDelete(endpointId: endpointId) { (response, error) in
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
 **endpointId** | **String** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rateLimitsEndpointIdGet**
```swift
    open class func rateLimitsEndpointIdGet(endpointId: String, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Get rate limit for endpoint

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let endpointId = "endpointId_example" // String | 

// Get rate limit for endpoint
RateLimitsAPI.rateLimitsEndpointIdGet(endpointId: endpointId) { (response, error) in
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
 **endpointId** | **String** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rateLimitsEndpointIdPost**
```swift
    open class func rateLimitsEndpointIdPost(endpointId: String, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Set rate limit for endpoint

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let endpointId = "endpointId_example" // String | 

// Set rate limit for endpoint
RateLimitsAPI.rateLimitsEndpointIdPost(endpointId: endpointId) { (response, error) in
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
 **endpointId** | **String** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rateLimitsGet**
```swift
    open class func rateLimitsGet(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

List rate limits

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List rate limits
RateLimitsAPI.rateLimitsGet() { (response, error) in
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

