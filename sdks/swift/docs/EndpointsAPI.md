# EndpointsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**endpointsGet**](EndpointsAPI.md#endpointsget) | **GET** /endpoints | List all endpoints
[**endpointsIdDelete**](EndpointsAPI.md#endpointsiddelete) | **DELETE** /endpoints/{id} | Delete endpoint
[**endpointsIdGet**](EndpointsAPI.md#endpointsidget) | **GET** /endpoints/{id} | Get endpoint by ID
[**endpointsIdPut**](EndpointsAPI.md#endpointsidput) | **PUT** /endpoints/{id} | Update endpoint
[**endpointsIdRetryPolicyPut**](EndpointsAPI.md#endpointsidretrypolicyput) | **PUT** /endpoints/{id}/retry-policy | Update retry policy for an endpoint
[**endpointsIdRotateSecretPost**](EndpointsAPI.md#endpointsidrotatesecretpost) | **POST** /endpoints/{id}/rotate-secret | Rotate endpoint signing secret
[**endpointsPost**](EndpointsAPI.md#endpointspost) | **POST** /endpoints | Create a new endpoint


# **endpointsGet**
```swift
    open class func endpointsGet(completion: @escaping (_ data: [Endpoint]?, _ error: Error?) -> Void)
```

List all endpoints

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List all endpoints
EndpointsAPI.endpointsGet() { (response, error) in
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

[**[Endpoint]**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpointsIdDelete**
```swift
    open class func endpointsIdDelete(id: UUID, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Delete endpoint

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Delete endpoint
EndpointsAPI.endpointsIdDelete(id: id) { (response, error) in
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

# **endpointsIdGet**
```swift
    open class func endpointsIdGet(id: UUID, completion: @escaping (_ data: Endpoint?, _ error: Error?) -> Void)
```

Get endpoint by ID

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Get endpoint by ID
EndpointsAPI.endpointsIdGet(id: id) { (response, error) in
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

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpointsIdPut**
```swift
    open class func endpointsIdPut(id: UUID, updateEndpointRequest: UpdateEndpointRequest, completion: @escaping (_ data: Endpoint?, _ error: Error?) -> Void)
```

Update endpoint

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let updateEndpointRequest = UpdateEndpointRequest(url: "url_example", description: "description_example", isActive: false, allowedIps: ["allowedIps_example"], eventFilter: ["eventFilter_example"], customHeaders: 123, retryPolicy: RetryPolicy(maxAttempts: 123, backoff: "backoff_example", initialDelaySecs: 123, maxDelaySecs: 123), routingStrategy: "routingStrategy_example", fallbackUrl: "fallbackUrl_example", format: "format_example") // UpdateEndpointRequest | 

// Update endpoint
EndpointsAPI.endpointsIdPut(id: id, updateEndpointRequest: updateEndpointRequest) { (response, error) in
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
 **updateEndpointRequest** | [**UpdateEndpointRequest**](UpdateEndpointRequest.md) |  | 

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpointsIdRetryPolicyPut**
```swift
    open class func endpointsIdRetryPolicyPut(id: UUID, retryPolicy: RetryPolicy, completion: @escaping (_ data: Endpoint?, _ error: Error?) -> Void)
```

Update retry policy for an endpoint

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let retryPolicy = RetryPolicy(maxAttempts: 123, backoff: "backoff_example", initialDelaySecs: 123, maxDelaySecs: 123) // RetryPolicy | 

// Update retry policy for an endpoint
EndpointsAPI.endpointsIdRetryPolicyPut(id: id, retryPolicy: retryPolicy) { (response, error) in
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
 **retryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  | 

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpointsIdRotateSecretPost**
```swift
    open class func endpointsIdRotateSecretPost(id: UUID, completion: @escaping (_ data: EndpointsIdRotateSecretPost200Response?, _ error: Error?) -> Void)
```

Rotate endpoint signing secret

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Rotate endpoint signing secret
EndpointsAPI.endpointsIdRotateSecretPost(id: id) { (response, error) in
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

[**EndpointsIdRotateSecretPost200Response**](EndpointsIdRotateSecretPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpointsPost**
```swift
    open class func endpointsPost(createEndpointRequest: CreateEndpointRequest, completion: @escaping (_ data: Endpoint?, _ error: Error?) -> Void)
```

Create a new endpoint

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let createEndpointRequest = CreateEndpointRequest(url: "url_example", description: "description_example", allowedIps: ["allowedIps_example"], eventFilter: ["eventFilter_example"], customHeaders: 123, retryPolicy: RetryPolicy(maxAttempts: 123, backoff: "backoff_example", initialDelaySecs: 123, maxDelaySecs: 123), routingStrategy: "routingStrategy_example", fallbackUrl: "fallbackUrl_example", format: "format_example") // CreateEndpointRequest | 

// Create a new endpoint
EndpointsAPI.endpointsPost(createEndpointRequest: createEndpointRequest) { (response, error) in
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
 **createEndpointRequest** | [**CreateEndpointRequest**](CreateEndpointRequest.md) |  | 

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

