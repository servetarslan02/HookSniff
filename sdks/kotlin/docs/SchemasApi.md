# SchemasApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**schemasGet**](SchemasApi.md#schemasGet) | **GET** /schemas | List registered schemas |
| [**schemasIdGet**](SchemasApi.md#schemasIdGet) | **GET** /schemas/{id} | Get schema by ID |
| [**schemasIdValidatePost**](SchemasApi.md#schemasIdValidatePost) | **POST** /schemas/{id}/validate | Validate an event against a schema |
| [**schemasPost**](SchemasApi.md#schemasPost) | **POST** /schemas | Register a new JSON Schema |


<a id="schemasGet"></a>
# **schemasGet**
> schemasGet()

List registered schemas

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = SchemasApi()
try {
    apiInstance.schemasGet()
} catch (e: ClientException) {
    println("4xx response calling SchemasApi#schemasGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling SchemasApi#schemasGet")
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

<a id="schemasIdGet"></a>
# **schemasIdGet**
> schemasIdGet(id)

Get schema by ID

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = SchemasApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.schemasIdGet(id)
} catch (e: ClientException) {
    println("4xx response calling SchemasApi#schemasIdGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling SchemasApi#schemasIdGet")
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

<a id="schemasIdValidatePost"></a>
# **schemasIdValidatePost**
> schemasIdValidatePost(id, validateEventRequest)

Validate an event against a schema

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = SchemasApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val validateEventRequest : ValidateEventRequest =  // ValidateEventRequest | 
try {
    apiInstance.schemasIdValidatePost(id, validateEventRequest)
} catch (e: ClientException) {
    println("4xx response calling SchemasApi#schemasIdValidatePost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling SchemasApi#schemasIdValidatePost")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **validateEventRequest** | [**ValidateEventRequest**](ValidateEventRequest.md)|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="schemasPost"></a>
# **schemasPost**
> schemasPost(registerSchemaRequest)

Register a new JSON Schema

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = SchemasApi()
val registerSchemaRequest : RegisterSchemaRequest =  // RegisterSchemaRequest | 
try {
    apiInstance.schemasPost(registerSchemaRequest)
} catch (e: ClientException) {
    println("4xx response calling SchemasApi#schemasPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling SchemasApi#schemasPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **registerSchemaRequest** | [**RegisterSchemaRequest**](RegisterSchemaRequest.md)|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

