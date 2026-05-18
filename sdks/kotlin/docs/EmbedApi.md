# EmbedApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**embedGet**](EmbedApi.md#embedGet) | **GET** /embed | Embeddable portal HTML |
| [**embedScriptGet**](EmbedApi.md#embedScriptGet) | **GET** /embed/script | Embeddable portal JavaScript |


<a id="embedGet"></a>
# **embedGet**
> embedGet()

Embeddable portal HTML

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = EmbedApi()
try {
    apiInstance.embedGet()
} catch (e: ClientException) {
    println("4xx response calling EmbedApi#embedGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling EmbedApi#embedGet")
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

<a id="embedScriptGet"></a>
# **embedScriptGet**
> embedScriptGet()

Embeddable portal JavaScript

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = EmbedApi()
try {
    apiInstance.embedScriptGet()
} catch (e: ClientException) {
    println("4xx response calling EmbedApi#embedScriptGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling EmbedApi#embedScriptGet")
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

