# SimulatorApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**simulatorPost**](SimulatorApi.md#simulatorPost) | **POST** /simulator | Simulate a webhook delivery |


<a id="simulatorPost"></a>
# **simulatorPost**
> simulatorPost(simulatorPostRequest)

Simulate a webhook delivery

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = SimulatorApi()
val simulatorPostRequest : SimulatorPostRequest =  // SimulatorPostRequest | 
try {
    apiInstance.simulatorPost(simulatorPostRequest)
} catch (e: ClientException) {
    println("4xx response calling SimulatorApi#simulatorPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling SimulatorApi#simulatorPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **simulatorPostRequest** | [**SimulatorPostRequest**](SimulatorPostRequest.md)|  | [optional] |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

