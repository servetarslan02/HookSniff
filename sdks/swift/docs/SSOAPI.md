# SSOAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ssoConfigDelete**](SSOAPI.md#ssoconfigdelete) | **DELETE** /sso/config | Delete SSO configuration
[**ssoConfigGet**](SSOAPI.md#ssoconfigget) | **GET** /sso/config | Get SSO configuration
[**ssoConfigPost**](SSOAPI.md#ssoconfigpost) | **POST** /sso/config | Create/update SSO configuration
[**ssoTestPost**](SSOAPI.md#ssotestpost) | **POST** /sso/test | Test SSO connection


# **ssoConfigDelete**
```swift
    open class func ssoConfigDelete(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Delete SSO configuration

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Delete SSO configuration
SSOAPI.ssoConfigDelete() { (response, error) in
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

# **ssoConfigGet**
```swift
    open class func ssoConfigGet(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Get SSO configuration

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get SSO configuration
SSOAPI.ssoConfigGet() { (response, error) in
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

# **ssoConfigPost**
```swift
    open class func ssoConfigPost(ssoConfigPostRequest: SsoConfigPostRequest? = nil, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Create/update SSO configuration

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let ssoConfigPostRequest = _sso_config_post_request(provider: "provider_example", enabled: false) // SsoConfigPostRequest |  (optional)

// Create/update SSO configuration
SSOAPI.ssoConfigPost(ssoConfigPostRequest: ssoConfigPostRequest) { (response, error) in
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
 **ssoConfigPostRequest** | [**SsoConfigPostRequest**](SsoConfigPostRequest.md) |  | [optional] 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ssoTestPost**
```swift
    open class func ssoTestPost(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Test SSO connection

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Test SSO connection
SSOAPI.ssoTestPost() { (response, error) in
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

