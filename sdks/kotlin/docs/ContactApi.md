# ContactApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**contactPost**](ContactApi.md#contactPost) | **POST** /contact | Send contact form message |


<a id="contactPost"></a>
# **contactPost**
> ContactResponse contactPost(contactRequest)

Send contact form message

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = ContactApi()
val contactRequest : ContactRequest =  // ContactRequest | 
try {
    val result : ContactResponse = apiInstance.contactPost(contactRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling ContactApi#contactPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling ContactApi#contactPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **contactRequest** | [**ContactRequest**](ContactRequest.md)|  | |

### Return type

[**ContactResponse**](ContactResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

