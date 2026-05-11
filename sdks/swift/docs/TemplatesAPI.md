# TemplatesAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**templatesGet**](TemplatesAPI.md#templatesget) | **GET** /templates | List available templates
[**templatesIdApplyPost**](TemplatesAPI.md#templatesidapplypost) | **POST** /templates/{id}/apply | Apply template to an endpoint
[**templatesIdGet**](TemplatesAPI.md#templatesidget) | **GET** /templates/{id} | Get template by ID


# **templatesGet**
```swift
    open class func templatesGet(category: String? = nil, completion: @escaping (_ data: [WebhookTemplate]?, _ error: Error?) -> Void)
```

List available templates

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let category = "category_example" // String |  (optional)

// List available templates
TemplatesAPI.templatesGet(category: category) { (response, error) in
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
 **category** | **String** |  | [optional] 

### Return type

[**[WebhookTemplate]**](WebhookTemplate.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templatesIdApplyPost**
```swift
    open class func templatesIdApplyPost(id: String, applyTemplateRequest: ApplyTemplateRequest, completion: @escaping (_ data: ApplyTemplateResponse?, _ error: Error?) -> Void)
```

Apply template to an endpoint

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = "id_example" // String | 
let applyTemplateRequest = ApplyTemplateRequest(endpointId: 123, variables: 123) // ApplyTemplateRequest | 

// Apply template to an endpoint
TemplatesAPI.templatesIdApplyPost(id: id, applyTemplateRequest: applyTemplateRequest) { (response, error) in
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
 **applyTemplateRequest** | [**ApplyTemplateRequest**](ApplyTemplateRequest.md) |  | 

### Return type

[**ApplyTemplateResponse**](ApplyTemplateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templatesIdGet**
```swift
    open class func templatesIdGet(id: String, completion: @escaping (_ data: WebhookTemplate?, _ error: Error?) -> Void)
```

Get template by ID

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = "id_example" // String | 

// Get template by ID
TemplatesAPI.templatesIdGet(id: id) { (response, error) in
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

[**WebhookTemplate**](WebhookTemplate.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

