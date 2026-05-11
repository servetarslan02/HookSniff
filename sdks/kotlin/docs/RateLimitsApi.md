# RateLimitsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**rateLimitsEndpointIdDelete**](RateLimitsApi.md#rateLimitsEndpointIdDelete) | **DELETE** /rate-limits/{endpoint_id} | Delete rate limit for endpoint |
| [**rateLimitsEndpointIdGet**](RateLimitsApi.md#rateLimitsEndpointIdGet) | **GET** /rate-limits/{endpoint_id} | Get rate limit for endpoint |
| [**rateLimitsEndpointIdPost**](RateLimitsApi.md#rateLimitsEndpointIdPost) | **POST** /rate-limits/{endpoint_id} | Set rate limit for endpoint |
| [**rateLimitsGet**](RateLimitsApi.md#rateLimitsGet) | **GET** /rate-limits | List rate limits |


<a id="rateLimitsEndpointIdDelete"></a>
# **rateLimitsEndpointIdDelete**
> rateLimitsEndpointIdDelete(endpointId)

Delete rate limit for endpoint

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = RateLimitsApi()
val endpointId : kotlin.String = endpointId_example // kotlin.String | 
try {
    apiInstance.rateLimitsEndpointIdDelete(endpointId)
} catch (e: ClientException) {
    println("4xx response calling RateLimitsApi#rateLimitsEndpointIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling RateLimitsApi#rateLimitsEndpointIdDelete")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **endpointId** | **kotlin.String**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="rateLimitsEndpointIdGet"></a>
# **rateLimitsEndpointIdGet**
> rateLimitsEndpointIdGet(endpointId)

Get rate limit for endpoint

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = RateLimitsApi()
val endpointId : kotlin.String = endpointId_example // kotlin.String | 
try {
    apiInstance.rateLimitsEndpointIdGet(endpointId)
} catch (e: ClientException) {
    println("4xx response calling RateLimitsApi#rateLimitsEndpointIdGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling RateLimitsApi#rateLimitsEndpointIdGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **endpointId** | **kotlin.String**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="rateLimitsEndpointIdPost"></a>
# **rateLimitsEndpointIdPost**
> rateLimitsEndpointIdPost(endpointId)

Set rate limit for endpoint

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = RateLimitsApi()
val endpointId : kotlin.String = endpointId_example // kotlin.String | 
try {
    apiInstance.rateLimitsEndpointIdPost(endpointId)
} catch (e: ClientException) {
    println("4xx response calling RateLimitsApi#rateLimitsEndpointIdPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling RateLimitsApi#rateLimitsEndpointIdPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **endpointId** | **kotlin.String**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="rateLimitsGet"></a>
# **rateLimitsGet**
> rateLimitsGet()

List rate limits

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = RateLimitsApi()
try {
    apiInstance.rateLimitsGet()
} catch (e: ClientException) {
    println("4xx response calling RateLimitsApi#rateLimitsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling RateLimitsApi#rateLimitsGet")
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

