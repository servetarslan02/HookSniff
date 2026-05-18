# EventsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**eventsGet**](EventsApi.md#eventsGet) | **GET** /events | List event types |


<a id="eventsGet"></a>
# **eventsGet**
> eventsGet()

List event types

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = EventsApi()
try {
    apiInstance.eventsGet()
} catch (e: ClientException) {
    println("4xx response calling EventsApi#eventsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling EventsApi#eventsGet")
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

