# StreamApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**streamDeliveriesGet**](StreamApi.md#streamDeliveriesGet) | **GET** /stream/deliveries | Real-time delivery event stream (SSE) |


<a id="streamDeliveriesGet"></a>
# **streamDeliveriesGet**
> kotlin.String streamDeliveriesGet(endpointId, status, limit)

Real-time delivery event stream (SSE)

Server-Sent Events stream of webhook deliveries

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = StreamApi()
val endpointId : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val status : kotlin.String = status_example // kotlin.String | 
val limit : kotlin.Int = 56 // kotlin.Int | 
try {
    val result : kotlin.String = apiInstance.streamDeliveriesGet(endpointId, status, limit)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling StreamApi#streamDeliveriesGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling StreamApi#streamDeliveriesGet")
    e.printStackTrace()
}
```

### Parameters
| **endpointId** | **java.util.UUID**|  | [optional] |
| **status** | **kotlin.String**|  | [optional] |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **limit** | **kotlin.Int**|  | [optional] [default to 50] |

### Return type

**kotlin.String**

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

