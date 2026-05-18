# APIKeysApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**apiKeysGet**](APIKeysApi.md#apiKeysGet) | **GET** /api-keys | List API keys |
| [**apiKeysIdDelete**](APIKeysApi.md#apiKeysIdDelete) | **DELETE** /api-keys/{id} | Delete (revoke) an API key |
| [**apiKeysIdRotatePost**](APIKeysApi.md#apiKeysIdRotatePost) | **POST** /api-keys/{id}/rotate | Rotate an API key |
| [**apiKeysPost**](APIKeysApi.md#apiKeysPost) | **POST** /api-keys | Create a new API key |


<a id="apiKeysGet"></a>
# **apiKeysGet**
> kotlin.collections.List&lt;ApiKeyInfo&gt; apiKeysGet()

List API keys

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = APIKeysApi()
try {
    val result : kotlin.collections.List<ApiKeyInfo> = apiInstance.apiKeysGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling APIKeysApi#apiKeysGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling APIKeysApi#apiKeysGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**kotlin.collections.List&lt;ApiKeyInfo&gt;**](ApiKeyInfo.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="apiKeysIdDelete"></a>
# **apiKeysIdDelete**
> apiKeysIdDelete(id)

Delete (revoke) an API key

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = APIKeysApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.apiKeysIdDelete(id)
} catch (e: ClientException) {
    println("4xx response calling APIKeysApi#apiKeysIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling APIKeysApi#apiKeysIdDelete")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="apiKeysIdRotatePost"></a>
# **apiKeysIdRotatePost**
> CreateApiKeyResponse apiKeysIdRotatePost(id)

Rotate an API key

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = APIKeysApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : CreateApiKeyResponse = apiInstance.apiKeysIdRotatePost(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling APIKeysApi#apiKeysIdRotatePost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling APIKeysApi#apiKeysIdRotatePost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="apiKeysPost"></a>
# **apiKeysPost**
> CreateApiKeyResponse apiKeysPost()

Create a new API key

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = APIKeysApi()
try {
    val result : CreateApiKeyResponse = apiInstance.apiKeysPost()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling APIKeysApi#apiKeysPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling APIKeysApi#apiKeysPost")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

