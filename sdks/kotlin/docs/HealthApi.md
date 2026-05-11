# HealthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**endpointHealthGet**](HealthApi.md#endpointHealthGet) | **GET** /endpoint-health | List endpoint health statuses |
| [**endpointHealthIdGet**](HealthApi.md#endpointHealthIdGet) | **GET** /endpoint-health/{id} | Get specific endpoint health |
| [**statusGet**](HealthApi.md#statusGet) | **GET** /status | System status (public) |


<a id="endpointHealthGet"></a>
# **endpointHealthGet**
> kotlin.collections.List&lt;EndpointHealth&gt; endpointHealthGet()

List endpoint health statuses

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = HealthApi()
try {
    val result : kotlin.collections.List<EndpointHealth> = apiInstance.endpointHealthGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling HealthApi#endpointHealthGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling HealthApi#endpointHealthGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**kotlin.collections.List&lt;EndpointHealth&gt;**](EndpointHealth.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="endpointHealthIdGet"></a>
# **endpointHealthIdGet**
> EndpointHealth endpointHealthIdGet(id)

Get specific endpoint health

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = HealthApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : EndpointHealth = apiInstance.endpointHealthIdGet(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling HealthApi#endpointHealthIdGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling HealthApi#endpointHealthIdGet")
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

<a id="statusGet"></a>
# **statusGet**
> SystemStatus statusGet()

System status (public)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = HealthApi()
try {
    val result : SystemStatus = apiInstance.statusGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling HealthApi#statusGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling HealthApi#statusGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**SystemStatus**](SystemStatus.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

