# RoutingAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**endpointsIdHealthGet**](RoutingAPI.md#endpointsidhealthget) | **GET** /endpoints/{id}/health | Get endpoint health status
[**endpointsIdRoutingGet**](RoutingAPI.md#endpointsidroutingget) | **GET** /endpoints/{id}/routing | Get routing config for endpoint
[**endpointsIdRoutingPut**](RoutingAPI.md#endpointsidroutingput) | **PUT** /endpoints/{id}/routing | Update routing config
[**routingIdHealthGet**](RoutingAPI.md#routingidhealthget) | **GET** /routing/{id}/health | Get endpoint health status
[**routingIdRoutingGet**](RoutingAPI.md#routingidroutingget) | **GET** /routing/{id}/routing | Get routing config for endpoint
[**routingIdRoutingPut**](RoutingAPI.md#routingidroutingput) | **PUT** /routing/{id}/routing | Update routing config


# **endpointsIdHealthGet**
```swift
    open class func endpointsIdHealthGet(id: UUID, completion: @escaping (_ data: EndpointHealth?, _ error: Error?) -> Void)
```

Get endpoint health status

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Get endpoint health status
RoutingAPI.endpointsIdHealthGet(id: id) { (response, error) in
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

[**EndpointHealth**](EndpointHealth.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpointsIdRoutingGet**
```swift
    open class func endpointsIdRoutingGet(id: UUID, completion: @escaping (_ data: RoutingInfo?, _ error: Error?) -> Void)
```

Get routing config for endpoint

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Get routing config for endpoint
RoutingAPI.endpointsIdRoutingGet(id: id) { (response, error) in
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

[**RoutingInfo**](RoutingInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpointsIdRoutingPut**
```swift
    open class func endpointsIdRoutingPut(id: UUID, updateRoutingRequest: UpdateRoutingRequest, completion: @escaping (_ data: RoutingInfo?, _ error: Error?) -> Void)
```

Update routing config

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let updateRoutingRequest = UpdateRoutingRequest(routingStrategy: "routingStrategy_example", fallbackUrl: "fallbackUrl_example") // UpdateRoutingRequest | 

// Update routing config
RoutingAPI.endpointsIdRoutingPut(id: id, updateRoutingRequest: updateRoutingRequest) { (response, error) in
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
 **updateRoutingRequest** | [**UpdateRoutingRequest**](UpdateRoutingRequest.md) |  | 

### Return type

[**RoutingInfo**](RoutingInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **routingIdHealthGet**
```swift
    open class func routingIdHealthGet(id: String, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Get endpoint health status

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = "id_example" // String | 

// Get endpoint health status
RoutingAPI.routingIdHealthGet(id: id) { (response, error) in
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
 **id** | **String** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **routingIdRoutingGet**
```swift
    open class func routingIdRoutingGet(id: String, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Get routing config for endpoint

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = "id_example" // String | 

// Get routing config for endpoint
RoutingAPI.routingIdRoutingGet(id: id) { (response, error) in
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
 **id** | **String** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **routingIdRoutingPut**
```swift
    open class func routingIdRoutingPut(id: String, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Update routing config

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = "id_example" // String | 

// Update routing config
RoutingAPI.routingIdRoutingPut(id: id) { (response, error) in
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
 **id** | **String** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

