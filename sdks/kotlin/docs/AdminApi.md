# AdminApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**adminRevenueGet**](AdminApi.md#adminRevenueGet) | **GET** /admin/revenue | Revenue by month (admin) |
| [**adminSdkUpdatePost**](AdminApi.md#adminSdkUpdatePost) | **POST** /admin/sdk-update | Send SDK update notification to users |
| [**adminStatsGet**](AdminApi.md#adminStatsGet) | **GET** /admin/stats | System-wide statistics (admin) |
| [**adminUsersGet**](AdminApi.md#adminUsersGet) | **GET** /admin/users | List all users (admin) |
| [**adminUsersIdGet**](AdminApi.md#adminUsersIdGet) | **GET** /admin/users/{id} | Get user details (admin) |
| [**adminUsersIdPlanPut**](AdminApi.md#adminUsersIdPlanPut) | **PUT** /admin/users/{id}/plan | Change user plan (admin) |
| [**adminUsersIdStatusPut**](AdminApi.md#adminUsersIdStatusPut) | **PUT** /admin/users/{id}/status | Change user status (admin) |


<a id="adminRevenueGet"></a>
# **adminRevenueGet**
> kotlin.collections.List&lt;AdminRevenueGet200ResponseInner&gt; adminRevenueGet()

Revenue by month (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

val apiInstance = AdminApi()
try {
    val result : kotlin.collections.List<AdminRevenueGet200ResponseInner> = apiInstance.adminRevenueGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminRevenueGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminRevenueGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**kotlin.collections.List&lt;AdminRevenueGet200ResponseInner&gt;**](AdminRevenueGet200ResponseInner.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminSdkUpdatePost"></a>
# **adminSdkUpdatePost**
> adminSdkUpdatePost(adminSdkUpdatePostRequest)

Send SDK update notification to users

### Example
```kotlin
// Import classes:
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

val apiInstance = AdminApi()
val adminSdkUpdatePostRequest : AdminSdkUpdatePostRequest =  // AdminSdkUpdatePostRequest | 
try {
    apiInstance.adminSdkUpdatePost(adminSdkUpdatePostRequest)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminSdkUpdatePost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminSdkUpdatePost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **adminSdkUpdatePostRequest** | [**AdminSdkUpdatePostRequest**](AdminSdkUpdatePostRequest.md)|  | [optional] |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="adminStatsGet"></a>
# **adminStatsGet**
> SystemStats adminStatsGet()

System-wide statistics (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

val apiInstance = AdminApi()
try {
    val result : SystemStats = apiInstance.adminStatsGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminStatsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminStatsGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**SystemStats**](SystemStats.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminUsersGet"></a>
# **adminUsersGet**
> PaginatedUsers adminUsersGet(page, perPage)

List all users (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

val apiInstance = AdminApi()
val page : kotlin.Int = 56 // kotlin.Int | 
val perPage : kotlin.Int = 56 // kotlin.Int | 
try {
    val result : PaginatedUsers = apiInstance.adminUsersGet(page, perPage)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminUsersGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminUsersGet")
    e.printStackTrace()
}
```

### Parameters
| **page** | **kotlin.Int**|  | [optional] |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **perPage** | **kotlin.Int**|  | [optional] |

### Return type

[**PaginatedUsers**](PaginatedUsers.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminUsersIdGet"></a>
# **adminUsersIdGet**
> adminUsersIdGet(id)

Get user details (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

val apiInstance = AdminApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.adminUsersIdGet(id)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminUsersIdGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminUsersIdGet")
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

<a id="adminUsersIdPlanPut"></a>
# **adminUsersIdPlanPut**
> adminUsersIdPlanPut(id, adminUsersIdPlanPutRequest)

Change user plan (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

val apiInstance = AdminApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val adminUsersIdPlanPutRequest : AdminUsersIdPlanPutRequest =  // AdminUsersIdPlanPutRequest | 
try {
    apiInstance.adminUsersIdPlanPut(id, adminUsersIdPlanPutRequest)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminUsersIdPlanPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminUsersIdPlanPut")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **adminUsersIdPlanPutRequest** | [**AdminUsersIdPlanPutRequest**](AdminUsersIdPlanPutRequest.md)|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="adminUsersIdStatusPut"></a>
# **adminUsersIdStatusPut**
> adminUsersIdStatusPut(id, adminUsersIdStatusPutRequest)

Change user status (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.sdk.infrastructure.*
//import hooksniff.sdk.models.*

val apiInstance = AdminApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val adminUsersIdStatusPutRequest : AdminUsersIdStatusPutRequest =  // AdminUsersIdStatusPutRequest | 
try {
    apiInstance.adminUsersIdStatusPut(id, adminUsersIdStatusPutRequest)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminUsersIdStatusPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminUsersIdStatusPut")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **adminUsersIdStatusPutRequest** | [**AdminUsersIdStatusPutRequest**](AdminUsersIdStatusPutRequest.md)|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

