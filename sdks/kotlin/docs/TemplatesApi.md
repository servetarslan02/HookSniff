# TemplatesApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**templatesGet**](TemplatesApi.md#templatesGet) | **GET** /templates | List available templates |
| [**templatesIdApplyPost**](TemplatesApi.md#templatesIdApplyPost) | **POST** /templates/{id}/apply | Apply template to an endpoint |
| [**templatesIdGet**](TemplatesApi.md#templatesIdGet) | **GET** /templates/{id} | Get template by ID |


<a id="templatesGet"></a>
# **templatesGet**
> kotlin.collections.List&lt;WebhookTemplate&gt; templatesGet(category)

List available templates

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TemplatesApi()
val category : kotlin.String = category_example // kotlin.String | 
try {
    val result : kotlin.collections.List<WebhookTemplate> = apiInstance.templatesGet(category)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling TemplatesApi#templatesGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TemplatesApi#templatesGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **category** | **kotlin.String**|  | [optional] |

### Return type

[**kotlin.collections.List&lt;WebhookTemplate&gt;**](WebhookTemplate.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="templatesIdApplyPost"></a>
# **templatesIdApplyPost**
> ApplyTemplateResponse templatesIdApplyPost(id, applyTemplateRequest)

Apply template to an endpoint

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TemplatesApi()
val id : kotlin.String = id_example // kotlin.String | 
val applyTemplateRequest : ApplyTemplateRequest =  // ApplyTemplateRequest | 
try {
    val result : ApplyTemplateResponse = apiInstance.templatesIdApplyPost(id, applyTemplateRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling TemplatesApi#templatesIdApplyPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TemplatesApi#templatesIdApplyPost")
    e.printStackTrace()
}
```

### Parameters
| **id** | **kotlin.String**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **applyTemplateRequest** | [**ApplyTemplateRequest**](ApplyTemplateRequest.md)|  | |

### Return type

[**ApplyTemplateResponse**](ApplyTemplateResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="templatesIdGet"></a>
# **templatesIdGet**
> WebhookTemplate templatesIdGet(id)

Get template by ID

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TemplatesApi()
val id : kotlin.String = id_example // kotlin.String | 
try {
    val result : WebhookTemplate = apiInstance.templatesIdGet(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling TemplatesApi#templatesIdGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TemplatesApi#templatesIdGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **kotlin.String**|  | |

### Return type

[**WebhookTemplate**](WebhookTemplate.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

