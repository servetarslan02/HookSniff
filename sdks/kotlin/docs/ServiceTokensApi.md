# ServiceTokensApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**serviceTokensGet**](ServiceTokensApi.md#serviceTokensGet) | **GET** /service-tokens | List service tokens |
| [**serviceTokensIdDelete**](ServiceTokensApi.md#serviceTokensIdDelete) | **DELETE** /service-tokens/{id} | Delete service token |
| [**serviceTokensIdPut**](ServiceTokensApi.md#serviceTokensIdPut) | **PUT** /service-tokens/{id} | Update service token |
| [**serviceTokensIdRevealPost**](ServiceTokensApi.md#serviceTokensIdRevealPost) | **POST** /service-tokens/{id}/reveal | Reveal service token |
| [**serviceTokensPost**](ServiceTokensApi.md#serviceTokensPost) | **POST** /service-tokens | Create a service token |


<a id="serviceTokensGet"></a>
# **serviceTokensGet**
> kotlin.collections.List&lt;ServiceToken&gt; serviceTokensGet()

List service tokens

Returns all service tokens for the authenticated user

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = ServiceTokensApi()
try {
    val result : kotlin.collections.List<ServiceToken> = apiInstance.serviceTokensGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling ServiceTokensApi#serviceTokensGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling ServiceTokensApi#serviceTokensGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**kotlin.collections.List&lt;ServiceToken&gt;**](ServiceToken.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="serviceTokensIdDelete"></a>
# **serviceTokensIdDelete**
> serviceTokensIdDelete(id)

Delete service token

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = ServiceTokensApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.serviceTokensIdDelete(id)
} catch (e: ClientException) {
    println("4xx response calling ServiceTokensApi#serviceTokensIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling ServiceTokensApi#serviceTokensIdDelete")
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

<a id="serviceTokensIdPut"></a>
# **serviceTokensIdPut**
> serviceTokensIdPut(id, serviceTokensIdPutRequest)

Update service token

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = ServiceTokensApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val serviceTokensIdPutRequest : ServiceTokensIdPutRequest =  // ServiceTokensIdPutRequest | 
try {
    apiInstance.serviceTokensIdPut(id, serviceTokensIdPutRequest)
} catch (e: ClientException) {
    println("4xx response calling ServiceTokensApi#serviceTokensIdPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling ServiceTokensApi#serviceTokensIdPut")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **serviceTokensIdPutRequest** | [**ServiceTokensIdPutRequest**](ServiceTokensIdPutRequest.md)|  | [optional] |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="serviceTokensIdRevealPost"></a>
# **serviceTokensIdRevealPost**
> ServiceTokensIdRevealPost200Response serviceTokensIdRevealPost(id)

Reveal service token

Returns the full token value (only available once after creation, or via this endpoint)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = ServiceTokensApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : ServiceTokensIdRevealPost200Response = apiInstance.serviceTokensIdRevealPost(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling ServiceTokensApi#serviceTokensIdRevealPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling ServiceTokensApi#serviceTokensIdRevealPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**ServiceTokensIdRevealPost200Response**](ServiceTokensIdRevealPost200Response.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="serviceTokensPost"></a>
# **serviceTokensPost**
> ServiceTokenCreateResponse serviceTokensPost(serviceTokensPostRequest)

Create a service token

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = ServiceTokensApi()
val serviceTokensPostRequest : ServiceTokensPostRequest =  // ServiceTokensPostRequest | 
try {
    val result : ServiceTokenCreateResponse = apiInstance.serviceTokensPost(serviceTokensPostRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling ServiceTokensApi#serviceTokensPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling ServiceTokensApi#serviceTokensPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **serviceTokensPostRequest** | [**ServiceTokensPostRequest**](ServiceTokensPostRequest.md)|  | |

### Return type

[**ServiceTokenCreateResponse**](ServiceTokenCreateResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

