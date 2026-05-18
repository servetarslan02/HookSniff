# SSOApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**ssoConfigDelete**](SSOApi.md#ssoConfigDelete) | **DELETE** /sso/config | Delete SSO configuration |
| [**ssoConfigGet**](SSOApi.md#ssoConfigGet) | **GET** /sso/config | Get SSO configuration |
| [**ssoConfigPost**](SSOApi.md#ssoConfigPost) | **POST** /sso/config | Create/update SSO configuration |
| [**ssoTestPost**](SSOApi.md#ssoTestPost) | **POST** /sso/test | Test SSO connection |


<a id="ssoConfigDelete"></a>
# **ssoConfigDelete**
> ssoConfigDelete()

Delete SSO configuration

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = SSOApi()
try {
    apiInstance.ssoConfigDelete()
} catch (e: ClientException) {
    println("4xx response calling SSOApi#ssoConfigDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling SSOApi#ssoConfigDelete")
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

<a id="ssoConfigGet"></a>
# **ssoConfigGet**
> ssoConfigGet()

Get SSO configuration

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = SSOApi()
try {
    apiInstance.ssoConfigGet()
} catch (e: ClientException) {
    println("4xx response calling SSOApi#ssoConfigGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling SSOApi#ssoConfigGet")
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

<a id="ssoConfigPost"></a>
# **ssoConfigPost**
> ssoConfigPost(ssoConfigPostRequest)

Create/update SSO configuration

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = SSOApi()
val ssoConfigPostRequest : SsoConfigPostRequest =  // SsoConfigPostRequest | 
try {
    apiInstance.ssoConfigPost(ssoConfigPostRequest)
} catch (e: ClientException) {
    println("4xx response calling SSOApi#ssoConfigPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling SSOApi#ssoConfigPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **ssoConfigPostRequest** | [**SsoConfigPostRequest**](SsoConfigPostRequest.md)|  | [optional] |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="ssoTestPost"></a>
# **ssoTestPost**
> ssoTestPost()

Test SSO connection

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = SSOApi()
try {
    apiInstance.ssoTestPost()
} catch (e: ClientException) {
    println("4xx response calling SSOApi#ssoTestPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling SSOApi#ssoTestPost")
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

