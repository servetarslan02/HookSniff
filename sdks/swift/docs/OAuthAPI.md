# OAuthAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**oauthGithubCallbackGet**](OAuthAPI.md#oauthgithubcallbackget) | **GET** /oauth/github/callback | GitHub OAuth callback
[**oauthGithubGet**](OAuthAPI.md#oauthgithubget) | **GET** /oauth/github | GitHub OAuth login redirect
[**oauthGoogleCallbackGet**](OAuthAPI.md#oauthgooglecallbackget) | **GET** /oauth/google/callback | Google OAuth callback
[**oauthGoogleGet**](OAuthAPI.md#oauthgoogleget) | **GET** /oauth/google | Google OAuth login redirect
[**oauthProvidersGet**](OAuthAPI.md#oauthprovidersget) | **GET** /oauth/providers | List available OAuth providers


# **oauthGithubCallbackGet**
```swift
    open class func oauthGithubCallbackGet(code: String, state: String, error: String? = nil, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

GitHub OAuth callback

Handles GitHub OAuth callback, creates/links account, sets auth cookies

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let code = "code_example" // String | Authorization code from GitHub
let state = "state_example" // String | CSRF state token (verified against cookie)
let error = "error_example" // String | Error from GitHub (e.g. access_denied) (optional)

// GitHub OAuth callback
OAuthAPI.oauthGithubCallbackGet(code: code, state: state, error: error) { (response, error) in
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
 **code** | **String** | Authorization code from GitHub | 
 **state** | **String** | CSRF state token (verified against cookie) | 
 **error** | **String** | Error from GitHub (e.g. access_denied) | [optional] 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **oauthGithubGet**
```swift
    open class func oauthGithubGet(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

GitHub OAuth login redirect

Redirects to GitHub OAuth consent screen with CSRF state cookie

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// GitHub OAuth login redirect
OAuthAPI.oauthGithubGet() { (response, error) in
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

