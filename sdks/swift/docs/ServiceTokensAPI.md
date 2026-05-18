# ServiceTokensAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**serviceTokensGet**](ServiceTokensAPI.md#servicetokensget) | **GET** /service-tokens | List service tokens
[**serviceTokensIdDelete**](ServiceTokensAPI.md#servicetokensiddelete) | **DELETE** /service-tokens/{id} | Delete service token
[**serviceTokensIdPut**](ServiceTokensAPI.md#servicetokensidput) | **PUT** /service-tokens/{id} | Update service token
[**serviceTokensIdRevealPost**](ServiceTokensAPI.md#servicetokensidrevealpost) | **POST** /service-tokens/{id}/reveal | Reveal service token
[**serviceTokensPost**](ServiceTokensAPI.md#servicetokenspost) | **POST** /service-tokens | Create a service token


# **serviceTokensGet**
```swift
    open class func serviceTokensGet(completion: @escaping (_ data: [ServiceToken]?, _ error: Error?) -> Void)
```

List service tokens

Returns all service tokens for the authenticated user

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List service tokens
ServiceTokensAPI.serviceTokensGet() { (response, error) in
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

[**[ServiceToken]**](ServiceToken.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **serviceTokensIdDelete**
```swift
    open class func serviceTokensIdDelete(id: UUID, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Delete service token

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Delete service token
ServiceTokensAPI.serviceTokensIdDelete(id: id) { (response, error) in
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

# **serviceTokensIdPut**
```swift
    open class func serviceTokensIdPut(id: UUID, serviceTokensIdPutRequest: ServiceTokensIdPutRequest? = nil, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Update service token

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let serviceTokensIdPutRequest = _service_tokens__id__put_request(name: "name_example") // ServiceTokensIdPutRequest |  (optional)

// Update service token
ServiceTokensAPI.serviceTokensIdPut(id: id, serviceTokensIdPutRequest: serviceTokensIdPutRequest) { (response, error) in
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
 **serviceTokensIdPutRequest** | [**ServiceTokensIdPutRequest**](ServiceTokensIdPutRequest.md) |  | [optional] 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **serviceTokensIdRevealPost**
```swift
    open class func serviceTokensIdRevealPost(id: UUID, completion: @escaping (_ data: ServiceTokensIdRevealPost200Response?, _ error: Error?) -> Void)
```

Reveal service token

Returns the full token value (only available once after creation, or via this endpoint)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Reveal service token
ServiceTokensAPI.serviceTokensIdRevealPost(id: id) { (response, error) in
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

[**ServiceTokensIdRevealPost200Response**](ServiceTokensIdRevealPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **serviceTokensPost**
```swift
    open class func serviceTokensPost(serviceTokensPostRequest: ServiceTokensPostRequest, completion: @escaping (_ data: ServiceTokenCreateResponse?, _ error: Error?) -> Void)
```

Create a service token

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let serviceTokensPostRequest = _service_tokens_post_request(name: "name_example") // ServiceTokensPostRequest | 

// Create a service token
ServiceTokensAPI.serviceTokensPost(serviceTokensPostRequest: serviceTokensPostRequest) { (response, error) in
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
 **serviceTokensPostRequest** | [**ServiceTokensPostRequest**](ServiceTokensPostRequest.md) |  | 

### Return type

[**ServiceTokenCreateResponse**](ServiceTokenCreateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

