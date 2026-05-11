# CustomDomainsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**customDomainsGet**](CustomDomainsApi.md#customDomainsGet) | **GET** /custom-domains | List custom domains |
| [**customDomainsIdDelete**](CustomDomainsApi.md#customDomainsIdDelete) | **DELETE** /custom-domains/{id} | Delete custom domain |
| [**customDomainsIdVerifyPost**](CustomDomainsApi.md#customDomainsIdVerifyPost) | **POST** /custom-domains/{id}/verify | Verify domain ownership |
| [**customDomainsPost**](CustomDomainsApi.md#customDomainsPost) | **POST** /custom-domains | Add custom domain |


<a id="customDomainsGet"></a>
# **customDomainsGet**
> customDomainsGet()

List custom domains

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomDomainsApi()
try {
    apiInstance.customDomainsGet()
} catch (e: ClientException) {
    println("4xx response calling CustomDomainsApi#customDomainsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomDomainsApi#customDomainsGet")
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

<a id="customDomainsIdDelete"></a>
# **customDomainsIdDelete**
> customDomainsIdDelete(id)

Delete custom domain

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomDomainsApi()
val id : kotlin.String = id_example // kotlin.String | 
try {
    apiInstance.customDomainsIdDelete(id)
} catch (e: ClientException) {
    println("4xx response calling CustomDomainsApi#customDomainsIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomDomainsApi#customDomainsIdDelete")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **kotlin.String**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="customDomainsIdVerifyPost"></a>
# **customDomainsIdVerifyPost**
> customDomainsIdVerifyPost(id)

Verify domain ownership

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomDomainsApi()
val id : kotlin.String = id_example // kotlin.String | 
try {
    apiInstance.customDomainsIdVerifyPost(id)
} catch (e: ClientException) {
    println("4xx response calling CustomDomainsApi#customDomainsIdVerifyPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomDomainsApi#customDomainsIdVerifyPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **kotlin.String**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="customDomainsPost"></a>
# **customDomainsPost**
> customDomainsPost(customDomainsPostRequest)

Add custom domain

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomDomainsApi()
val customDomainsPostRequest : CustomDomainsPostRequest =  // CustomDomainsPostRequest | 
try {
    apiInstance.customDomainsPost(customDomainsPostRequest)
} catch (e: ClientException) {
    println("4xx response calling CustomDomainsApi#customDomainsPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomDomainsApi#customDomainsPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **customDomainsPostRequest** | [**CustomDomainsPostRequest**](CustomDomainsPostRequest.md)|  | [optional] |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

