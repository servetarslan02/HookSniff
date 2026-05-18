# CustomDomainsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**customDomainsGet**](CustomDomainsAPI.md#customdomainsget) | **GET** /custom-domains | List custom domains
[**customDomainsIdDelete**](CustomDomainsAPI.md#customdomainsiddelete) | **DELETE** /custom-domains/{id} | Delete custom domain
[**customDomainsIdVerifyPost**](CustomDomainsAPI.md#customdomainsidverifypost) | **POST** /custom-domains/{id}/verify | Verify domain ownership
[**customDomainsPost**](CustomDomainsAPI.md#customdomainspost) | **POST** /custom-domains | Add custom domain


# **customDomainsGet**
```swift
    open class func customDomainsGet(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

List custom domains

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List custom domains
CustomDomainsAPI.customDomainsGet() { (response, error) in
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

# **customDomainsIdDelete**
```swift
    open class func customDomainsIdDelete(id: String, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Delete custom domain

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = "id_example" // String | 

// Delete custom domain
CustomDomainsAPI.customDomainsIdDelete(id: id) { (response, error) in
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

# **customDomainsIdVerifyPost**
```swift
    open class func customDomainsIdVerifyPost(id: String, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Verify domain ownership

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = "id_example" // String | 

// Verify domain ownership
CustomDomainsAPI.customDomainsIdVerifyPost(id: id) { (response, error) in
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

# **customDomainsPost**
```swift
    open class func customDomainsPost(customDomainsPostRequest: CustomDomainsPostRequest? = nil, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Add custom domain

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let customDomainsPostRequest = _custom_domains_post_request(domain: "domain_example") // CustomDomainsPostRequest |  (optional)

// Add custom domain
CustomDomainsAPI.customDomainsPost(customDomainsPostRequest: customDomainsPostRequest) { (response, error) in
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
 **customDomainsPostRequest** | [**CustomDomainsPostRequest**](CustomDomainsPostRequest.md) |  | [optional] 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

