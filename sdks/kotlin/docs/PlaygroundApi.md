# PlaygroundApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**playgroundGet**](PlaygroundApi.md#playgroundGet) | **GET** /playground | Get playground info (endpoints, sample payloads) |
| [**playgroundTestPost**](PlaygroundApi.md#playgroundTestPost) | **POST** /playground/test | Test a webhook delivery |


<a id="playgroundGet"></a>
# **playgroundGet**
> PlaygroundGet200Response playgroundGet()

Get playground info (endpoints, sample payloads)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = PlaygroundApi()
try {
    val result : PlaygroundGet200Response = apiInstance.playgroundGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling PlaygroundApi#playgroundGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling PlaygroundApi#playgroundGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**PlaygroundGet200Response**](PlaygroundGet200Response.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="playgroundTestPost"></a>
# **playgroundTestPost**
> TestWebhookResponse playgroundTestPost(testWebhookRequest)

Test a webhook delivery

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = PlaygroundApi()
val testWebhookRequest : TestWebhookRequest =  // TestWebhookRequest | 
try {
    val result : TestWebhookResponse = apiInstance.playgroundTestPost(testWebhookRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling PlaygroundApi#playgroundTestPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling PlaygroundApi#playgroundTestPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **testWebhookRequest** | [**TestWebhookRequest**](TestWebhookRequest.md)|  | |

### Return type

[**TestWebhookResponse**](TestWebhookResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

