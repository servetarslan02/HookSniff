# SearchApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**searchGet**](SearchApi.md#searchGet) | **GET** /search | Search deliveries |


<a id="searchGet"></a>
# **searchGet**
> SearchResult searchGet(q, status, endpointId, page, perPage)

Search deliveries

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = SearchApi()
val q : kotlin.String = q_example // kotlin.String | 
val status : kotlin.String = status_example // kotlin.String | 
val endpointId : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val page : kotlin.Int = 56 // kotlin.Int | 
val perPage : kotlin.Int = 56 // kotlin.Int | 
try {
    val result : SearchResult = apiInstance.searchGet(q, status, endpointId, page, perPage)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling SearchApi#searchGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling SearchApi#searchGet")
    e.printStackTrace()
}
```

### Parameters
| **q** | **kotlin.String**|  | |
| **status** | **kotlin.String**|  | [optional] |
| **endpointId** | **java.util.UUID**|  | [optional] |
| **page** | **kotlin.Int**|  | [optional] |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **perPage** | **kotlin.Int**|  | [optional] |

### Return type

[**SearchResult**](SearchResult.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

