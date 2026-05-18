# StatsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**statsGet**](StatsApi.md#statsGet) | **GET** /stats | Get account statistics |


<a id="statsGet"></a>
# **statsGet**
> StatsResponse statsGet()

Get account statistics

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = StatsApi()
try {
    val result : StatsResponse = apiInstance.statsGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling StatsApi#statsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling StatsApi#statsGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**StatsResponse**](StatsResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

