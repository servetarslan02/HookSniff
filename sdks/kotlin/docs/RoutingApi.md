# RoutingApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**endpointsIdHealthGet**](RoutingApi.md#endpointsIdHealthGet) | **GET** /endpoints/{id}/health | Get endpoint health status |
| [**endpointsIdRoutingGet**](RoutingApi.md#endpointsIdRoutingGet) | **GET** /endpoints/{id}/routing | Get routing config for endpoint |
| [**endpointsIdRoutingPut**](RoutingApi.md#endpointsIdRoutingPut) | **PUT** /endpoints/{id}/routing | Update routing config |
| [**routingIdHealthGet**](RoutingApi.md#routingIdHealthGet) | **GET** /routing/{id}/health | Get endpoint health status |
| [**routingIdRoutingGet**](RoutingApi.md#routingIdRoutingGet) | **GET** /routing/{id}/routing | Get routing config for endpoint |
| [**routingIdRoutingPut**](RoutingApi.md#routingIdRoutingPut) | **PUT** /routing/{id}/routing | Update routing config |


<a id="endpointsIdHealthGet"></a>
# **endpointsIdHealthGet**
> EndpointHealth endpointsIdHealthGet(id)

Get endpoint health status

### Example
```kotlin
// Import classes:
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

val apiInstance = RoutingApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : EndpointHealth = apiInstance.endpointsIdHealthGet(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling RoutingApi#endpointsIdHealthGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling RoutingApi#endpointsIdHealthGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**EndpointHealth**](EndpointHealth.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="endpointsIdRoutingGet"></a>
# **endpointsIdRoutingGet**
> RoutingInfo endpointsIdRoutingGet(id)

Get routing config for endpoint

### Example
```kotlin
// Import classes:
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

val apiInstance = RoutingApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : RoutingInfo = apiInstance.endpointsIdRoutingGet(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling RoutingApi#endpointsIdRoutingGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling RoutingApi#endpointsIdRoutingGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**RoutingInfo**](RoutingInfo.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="endpointsIdRoutingPut"></a>
# **endpointsIdRoutingPut**
> RoutingInfo endpointsIdRoutingPut(id, updateRoutingRequest)

Update routing config

### Example
```kotlin
// Import classes:
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

val apiInstance = RoutingApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val updateRoutingRequest : UpdateRoutingRequest =  // UpdateRoutingRequest | 
try {
    val result : RoutingInfo = apiInstance.endpointsIdRoutingPut(id, updateRoutingRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling RoutingApi#endpointsIdRoutingPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling RoutingApi#endpointsIdRoutingPut")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **updateRoutingRequest** | [**UpdateRoutingRequest**](UpdateRoutingRequest.md)|  | |

### Return type

[**RoutingInfo**](RoutingInfo.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="routingIdHealthGet"></a>
# **routingIdHealthGet**
> routingIdHealthGet(id)

Get endpoint health status

### Example
```kotlin
// Import classes:
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

val apiInstance = RoutingApi()
val id : kotlin.String = id_example // kotlin.String | 
try {
    apiInstance.routingIdHealthGet(id)
} catch (e: ClientException) {
    println("4xx response calling RoutingApi#routingIdHealthGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling RoutingApi#routingIdHealthGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **kotlin.String**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="routingIdRoutingGet"></a>
# **routingIdRoutingGet**
> routingIdRoutingGet(id)

Get routing config for endpoint

### Example
```kotlin
// Import classes:
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

val apiInstance = RoutingApi()
val id : kotlin.String = id_example // kotlin.String | 
try {
    apiInstance.routingIdRoutingGet(id)
} catch (e: ClientException) {
    println("4xx response calling RoutingApi#routingIdRoutingGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling RoutingApi#routingIdRoutingGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **kotlin.String**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="routingIdRoutingPut"></a>
# **routingIdRoutingPut**
> routingIdRoutingPut(id)

Update routing config

### Example
```kotlin
// Import classes:
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

val apiInstance = RoutingApi()
val id : kotlin.String = id_example // kotlin.String | 
try {
    apiInstance.routingIdRoutingPut(id)
} catch (e: ClientException) {
    println("4xx response calling RoutingApi#routingIdRoutingPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling RoutingApi#routingIdRoutingPut")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **kotlin.String**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

