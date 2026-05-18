# OAuthAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**oauthGoogleCallbackGet**](OAuthAPI.md#oauthgooglecallbackget) | **GET** /oauth/google/callback | Google OAuth callback
[**oauthGoogleGet**](OAuthAPI.md#oauthgoogleget) | **GET** /oauth/google | Google OAuth login redirect
[**oauthProvidersGet**](OAuthAPI.md#oauthprovidersget) | **GET** /oauth/providers | List available OAuth providers


# **oauthGoogleCallbackGet**
```swift
    open class func oauthGoogleCallbackGet(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Google OAuth callback

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Google OAuth callback
OAuthAPI.oauthGoogleCallbackGet() { (response, error) in
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

# **oauthGoogleGet**
```swift
    open class func oauthGoogleGet(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Google OAuth login redirect

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Google OAuth login redirect
OAuthAPI.oauthGoogleGet() { (response, error) in
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

# **oauthProvidersGet**
```swift
    open class func oauthProvidersGet(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

List available OAuth providers

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List available OAuth providers
OAuthAPI.oauthProvidersGet() { (response, error) in
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

