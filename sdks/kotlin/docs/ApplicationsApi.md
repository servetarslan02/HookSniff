# ApplicationsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**applicationsGet**](ApplicationsApi.md#applicationsGet) | **GET** /applications | List applications |
| [**applicationsIdDelete**](ApplicationsApi.md#applicationsIdDelete) | **DELETE** /applications/{id} | Delete application |
| [**applicationsIdGet**](ApplicationsApi.md#applicationsIdGet) | **GET** /applications/{id} | Get application |
| [**applicationsIdPut**](ApplicationsApi.md#applicationsIdPut) | **PUT** /applications/{id} | Update application |
| [**applicationsPost**](ApplicationsApi.md#applicationsPost) | **POST** /applications | Create application |


<a id="applicationsGet"></a>
# **applicationsGet**
> kotlin.collections.List&lt;Application&gt; applicationsGet()

List applications

Returns all applications for the authenticated user

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = ApplicationsApi()
try {
    val result : kotlin.collections.List<Application> = apiInstance.applicationsGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling ApplicationsApi#applicationsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling ApplicationsApi#applicationsGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**kotlin.collections.List&lt;Application&gt;**](Application.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="applicationsIdDelete"></a>
# **applicationsIdDelete**
> applicationsIdDelete(id)

Delete application

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = ApplicationsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.applicationsIdDelete(id)
} catch (e: ClientException) {
    println("4xx response calling ApplicationsApi#applicationsIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling ApplicationsApi#applicationsIdDelete")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="applicationsIdGet"></a>
# **applicationsIdGet**
> Application applicationsIdGet(id)

Get application

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = ApplicationsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : Application = apiInstance.applicationsIdGet(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling ApplicationsApi#applicationsIdGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling ApplicationsApi#applicationsIdGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**Application**](Application.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="applicationsIdPut"></a>
# **applicationsIdPut**
> Application applicationsIdPut(id, applicationsIdPutRequest)

Update application

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = ApplicationsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val applicationsIdPutRequest : ApplicationsIdPutRequest =  // ApplicationsIdPutRequest | 
try {
    val result : Application = apiInstance.applicationsIdPut(id, applicationsIdPutRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling ApplicationsApi#applicationsIdPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling ApplicationsApi#applicationsIdPut")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **applicationsIdPutRequest** | [**ApplicationsIdPutRequest**](ApplicationsIdPutRequest.md)|  | [optional] |

### Return type

[**Application**](Application.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="applicationsPost"></a>
# **applicationsPost**
> Application applicationsPost(applicationsPostRequest)

Create application

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = ApplicationsApi()
val applicationsPostRequest : ApplicationsPostRequest =  // ApplicationsPostRequest | 
try {
    val result : Application = apiInstance.applicationsPost(applicationsPostRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling ApplicationsApi#applicationsPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling ApplicationsApi#applicationsPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **applicationsPostRequest** | [**ApplicationsPostRequest**](ApplicationsPostRequest.md)|  | |

### Return type

[**Application**](Application.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

