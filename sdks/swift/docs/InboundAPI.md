# InboundAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**inboundProviderEndpointIdPost**](InboundAPI.md#inboundproviderendpointidpost) | **POST** /inbound/{provider}/{endpoint_id} | Receive inbound webhook for a specific endpoint
[**inboundProviderPost**](InboundAPI.md#inboundproviderpost) | **POST** /inbound/{provider} | Receive inbound webhook from a provider


# **inboundProviderEndpointIdPost**
```swift
    open class func inboundProviderEndpointIdPost(provider: String, endpointId: UUID, body: AnyCodable, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Receive inbound webhook for a specific endpoint

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let provider = "provider_example" // String | 
let endpointId = 987 // UUID | 
let body = "TODO" // AnyCodable | 

// Receive inbound webhook for a specific endpoint
InboundAPI.inboundProviderEndpointIdPost(provider: provider, endpointId: endpointId, body: body) { (response, error) in
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
 **provider** | **String** |  | 
 **endpointId** | **UUID** |  | 
 **body** | **AnyCodable** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inboundProviderPost**
```swift
    open class func inboundProviderPost(provider: String, body: AnyCodable, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Receive inbound webhook from a provider

Accepts webhooks from external providers (Stripe, GitHub, etc.) and routes them to the customer's endpoints. 

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let provider = "provider_example" // String | 
let body = "TODO" // AnyCodable | 

// Receive inbound webhook from a provider
InboundAPI.inboundProviderPost(provider: provider, body: body) { (response, error) in
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
 **provider** | **String** |  | 
 **body** | **AnyCodable** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

