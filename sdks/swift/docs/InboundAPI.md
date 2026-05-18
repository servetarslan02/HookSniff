# InboundAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**inboundConfigsGet**](InboundAPI.md#inboundconfigsget) | **GET** /inbound/configs | List inbound webhook configs
[**inboundConfigsIdDelete**](InboundAPI.md#inboundconfigsiddelete) | **DELETE** /inbound/configs/{id} | Delete inbound config
[**inboundConfigsIdPut**](InboundAPI.md#inboundconfigsidput) | **PUT** /inbound/configs/{id} | Update inbound config
[**inboundConfigsPost**](InboundAPI.md#inboundconfigspost) | **POST** /inbound/configs | Create inbound webhook config
[**inboundProviderEndpointIdPost**](InboundAPI.md#inboundproviderendpointidpost) | **POST** /inbound/{provider}/{endpoint_id} | Receive inbound webhook for a specific endpoint
[**inboundProviderPost**](InboundAPI.md#inboundproviderpost) | **POST** /inbound/{provider} | Receive inbound webhook from a provider


# **inboundConfigsGet**
```swift
    open class func inboundConfigsGet(completion: @escaping (_ data: [InboundConfig]?, _ error: Error?) -> Void)
```

List inbound webhook configs

Returns all inbound webhook configurations for the authenticated user

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List inbound webhook configs
InboundAPI.inboundConfigsGet() { (response, error) in
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

[**[InboundConfig]**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inboundConfigsIdDelete**
```swift
    open class func inboundConfigsIdDelete(id: UUID, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Delete inbound config

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Delete inbound config
InboundAPI.inboundConfigsIdDelete(id: id) { (response, error) in
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

# **inboundConfigsIdPut**
```swift
    open class func inboundConfigsIdPut(id: UUID, inboundConfigsIdPutRequest: InboundConfigsIdPutRequest? = nil, completion: @escaping (_ data: InboundConfig?, _ error: Error?) -> Void)
```

Update inbound config

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let inboundConfigsIdPutRequest = _inbound_configs__id__put_request(secret: "secret_example", endpointId: 123, enabled: false) // InboundConfigsIdPutRequest |  (optional)

// Update inbound config
InboundAPI.inboundConfigsIdPut(id: id, inboundConfigsIdPutRequest: inboundConfigsIdPutRequest) { (response, error) in
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
 **inboundConfigsIdPutRequest** | [**InboundConfigsIdPutRequest**](InboundConfigsIdPutRequest.md) |  | [optional] 

### Return type

[**InboundConfig**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inboundConfigsPost**
```swift
    open class func inboundConfigsPost(inboundConfigsPostRequest: InboundConfigsPostRequest, completion: @escaping (_ data: InboundConfig?, _ error: Error?) -> Void)
```

Create inbound webhook config

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let inboundConfigsPostRequest = _inbound_configs_post_request(provider: "provider_example", secret: "secret_example", endpointId: 123, enabled: false) // InboundConfigsPostRequest | 

// Create inbound webhook config
InboundAPI.inboundConfigsPost(inboundConfigsPostRequest: inboundConfigsPostRequest) { (response, error) in
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
 **inboundConfigsPostRequest** | [**InboundConfigsPostRequest**](InboundConfigsPostRequest.md) |  | 

### Return type

[**InboundConfig**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

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

