# TransformsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**endpointsEndpointIdTransformsGet**](TransformsAPI.md#endpointsendpointidtransformsget) | **GET** /endpoints/{endpoint_id}/transforms | List transform rules for endpoint
[**endpointsEndpointIdTransformsIdDelete**](TransformsAPI.md#endpointsendpointidtransformsiddelete) | **DELETE** /endpoints/{endpoint_id}/transforms/{id} | Delete transform rule
[**endpointsEndpointIdTransformsIdPut**](TransformsAPI.md#endpointsendpointidtransformsidput) | **PUT** /endpoints/{endpoint_id}/transforms/{id} | Update transform rule
[**endpointsEndpointIdTransformsPost**](TransformsAPI.md#endpointsendpointidtransformspost) | **POST** /endpoints/{endpoint_id}/transforms | Create transform rule
[**endpointsEndpointIdTransformsTestPost**](TransformsAPI.md#endpointsendpointidtransformstestpost) | **POST** /endpoints/{endpoint_id}/transforms/test | Test a transform rule


# **endpointsEndpointIdTransformsGet**
```swift
    open class func endpointsEndpointIdTransformsGet(endpointId: UUID, completion: @escaping (_ data: [TransformRule]?, _ error: Error?) -> Void)
```

List transform rules for endpoint

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let endpointId = 987 // UUID | 

// List transform rules for endpoint
TransformsAPI.endpointsEndpointIdTransformsGet(endpointId: endpointId) { (response, error) in
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
 **endpointId** | **UUID** |  | 

### Return type

[**[TransformRule]**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpointsEndpointIdTransformsIdDelete**
```swift
    open class func endpointsEndpointIdTransformsIdDelete(endpointId: UUID, id: UUID, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Delete transform rule

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let endpointId = 987 // UUID | 
let id = 987 // UUID | 

// Delete transform rule
TransformsAPI.endpointsEndpointIdTransformsIdDelete(endpointId: endpointId, id: id) { (response, error) in
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
 **endpointId** | **UUID** |  | 
 **id** | **UUID** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpointsEndpointIdTransformsIdPut**
```swift
    open class func endpointsEndpointIdTransformsIdPut(endpointId: UUID, id: UUID, body: AnyCodable, completion: @escaping (_ data: TransformRule?, _ error: Error?) -> Void)
```

Update transform rule

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let endpointId = 987 // UUID | 
let id = 987 // UUID | 
let body = "TODO" // AnyCodable | 

// Update transform rule
TransformsAPI.endpointsEndpointIdTransformsIdPut(endpointId: endpointId, id: id, body: body) { (response, error) in
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
 **endpointId** | **UUID** |  | 
 **id** | **UUID** |  | 
 **body** | **AnyCodable** |  | 

### Return type

[**TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpointsEndpointIdTransformsPost**
```swift
    open class func endpointsEndpointIdTransformsPost(endpointId: UUID, createTransformRuleRequest: CreateTransformRuleRequest, completion: @escaping (_ data: TransformRule?, _ error: Error?) -> Void)
```

Create transform rule

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let endpointId = 987 // UUID | 
let createTransformRuleRequest = CreateTransformRuleRequest(name: "name_example", ruleType: "ruleType_example", config: 123) // CreateTransformRuleRequest | 

// Create transform rule
TransformsAPI.endpointsEndpointIdTransformsPost(endpointId: endpointId, createTransformRuleRequest: createTransformRuleRequest) { (response, error) in
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
 **endpointId** | **UUID** |  | 
 **createTransformRuleRequest** | [**CreateTransformRuleRequest**](CreateTransformRuleRequest.md) |  | 

### Return type

[**TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpointsEndpointIdTransformsTestPost**
```swift
    open class func endpointsEndpointIdTransformsTestPost(endpointId: UUID, endpointsEndpointIdTransformsTestPostRequest: EndpointsEndpointIdTransformsTestPostRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Test a transform rule

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let endpointId = 987 // UUID | 
let endpointsEndpointIdTransformsTestPostRequest = _endpoints__endpoint_id__transforms_test_post_request(payload: 123, ruleId: 123) // EndpointsEndpointIdTransformsTestPostRequest | 

// Test a transform rule
TransformsAPI.endpointsEndpointIdTransformsTestPost(endpointId: endpointId, endpointsEndpointIdTransformsTestPostRequest: endpointsEndpointIdTransformsTestPostRequest) { (response, error) in
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
 **endpointId** | **UUID** |  | 
 **endpointsEndpointIdTransformsTestPostRequest** | [**EndpointsEndpointIdTransformsTestPostRequest**](EndpointsEndpointIdTransformsTestPostRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

