# OAuthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**oauthGithubCallbackGet**](OAuthApi.md#oauthGithubCallbackGet) | **GET** /oauth/github/callback | GitHub OAuth callback |
| [**oauthGithubGet**](OAuthApi.md#oauthGithubGet) | **GET** /oauth/github | GitHub OAuth login redirect |
| [**oauthGoogleCallbackGet**](OAuthApi.md#oauthGoogleCallbackGet) | **GET** /oauth/google/callback | Google OAuth callback |
| [**oauthGoogleGet**](OAuthApi.md#oauthGoogleGet) | **GET** /oauth/google | Google OAuth login redirect |
| [**oauthProvidersGet**](OAuthApi.md#oauthProvidersGet) | **GET** /oauth/providers | List available OAuth providers |


<a id="oauthGithubCallbackGet"></a>
# **oauthGithubCallbackGet**
> oauthGithubCallbackGet(code, state, error)

GitHub OAuth callback

Handles GitHub OAuth callback, creates/links account, sets auth cookies

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = OAuthApi()
val code : kotlin.String = code_example // kotlin.String | Authorization code from GitHub
val state : kotlin.String = state_example // kotlin.String | CSRF state token (verified against cookie)
val error : kotlin.String = error_example // kotlin.String | Error from GitHub (e.g. access_denied)
try {
    apiInstance.oauthGithubCallbackGet(code, state, error)
} catch (e: ClientException) {
    println("4xx response calling OAuthApi#oauthGithubCallbackGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling OAuthApi#oauthGithubCallbackGet")
    e.printStackTrace()
}
```

### Parameters
| **code** | **kotlin.String**| Authorization code from GitHub | |
| **state** | **kotlin.String**| CSRF state token (verified against cookie) | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **error** | **kotlin.String**| Error from GitHub (e.g. access_denied) | [optional] |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="oauthGithubGet"></a>
# **oauthGithubGet**
> oauthGithubGet()

GitHub OAuth login redirect

Redirects to GitHub OAuth consent screen with CSRF state cookie

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = OAuthApi()
try {
    apiInstance.oauthGithubGet()
} catch (e: ClientException) {
    println("4xx response calling OAuthApi#oauthGithubGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling OAuthApi#oauthGithubGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="oauthGoogleCallbackGet"></a>
# **oauthGoogleCallbackGet**
> oauthGoogleCallbackGet()

Google OAuth callback

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = OAuthApi()
try {
    apiInstance.oauthGoogleCallbackGet()
} catch (e: ClientException) {
    println("4xx response calling OAuthApi#oauthGoogleCallbackGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling OAuthApi#oauthGoogleCallbackGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="oauthGoogleGet"></a>
# **oauthGoogleGet**
> oauthGoogleGet()

Google OAuth login redirect

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = OAuthApi()
try {
    apiInstance.oauthGoogleGet()
} catch (e: ClientException) {
    println("4xx response calling OAuthApi#oauthGoogleGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling OAuthApi#oauthGoogleGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="oauthProvidersGet"></a>
# **oauthProvidersGet**
> oauthProvidersGet()

List available OAuth providers

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = OAuthApi()
try {
    apiInstance.oauthProvidersGet()
} catch (e: ClientException) {
    println("4xx response calling OAuthApi#oauthProvidersGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling OAuthApi#oauthProvidersGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

