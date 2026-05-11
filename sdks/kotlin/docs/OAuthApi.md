# OAuthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**oauthGoogleCallbackGet**](OAuthApi.md#oauthGoogleCallbackGet) | **GET** /oauth/google/callback | Google OAuth callback |
| [**oauthGoogleGet**](OAuthApi.md#oauthGoogleGet) | **GET** /oauth/google | Google OAuth login redirect |
| [**oauthProvidersGet**](OAuthApi.md#oauthProvidersGet) | **GET** /oauth/providers | List available OAuth providers |


<a id="oauthGoogleCallbackGet"></a>
# **oauthGoogleCallbackGet**
> oauthGoogleCallbackGet()

Google OAuth callback

### Example
```kotlin
// Import classes:
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

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
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

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
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

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

