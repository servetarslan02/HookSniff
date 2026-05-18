# AuditLogApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**auditLogGet**](AuditLogApi.md#auditLogGet) | **GET** /audit-log | List audit log entries |
| [**auditLogIdGet**](AuditLogApi.md#auditLogIdGet) | **GET** /audit-log/{id} | Get audit entry detail |


<a id="auditLogGet"></a>
# **auditLogGet**
> auditLogGet(page, action)

List audit log entries

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuditLogApi()
val page : kotlin.Int = 56 // kotlin.Int | 
val action : kotlin.String = action_example // kotlin.String | 
try {
    apiInstance.auditLogGet(page, action)
} catch (e: ClientException) {
    println("4xx response calling AuditLogApi#auditLogGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuditLogApi#auditLogGet")
    e.printStackTrace()
}
```

### Parameters
| **page** | **kotlin.Int**|  | [optional] [default to 1] |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **action** | **kotlin.String**|  | [optional] |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="auditLogIdGet"></a>
# **auditLogIdGet**
> auditLogIdGet(id)

Get audit entry detail

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuditLogApi()
val id : kotlin.String = id_example // kotlin.String | 
try {
    apiInstance.auditLogIdGet(id)
} catch (e: ClientException) {
    println("4xx response calling AuditLogApi#auditLogIdGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuditLogApi#auditLogIdGet")
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

