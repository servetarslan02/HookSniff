# NotificationsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**notificationsGet**](NotificationsApi.md#notificationsGet) | **GET** /notifications | List notifications |
| [**notificationsIdDelete**](NotificationsApi.md#notificationsIdDelete) | **DELETE** /notifications/{id} | Delete notification |
| [**notificationsIdReadPut**](NotificationsApi.md#notificationsIdReadPut) | **PUT** /notifications/{id}/read | Mark notification as read |
| [**notificationsReadAllPut**](NotificationsApi.md#notificationsReadAllPut) | **PUT** /notifications/read-all | Mark all notifications as read |
| [**notificationsUnreadCountGet**](NotificationsApi.md#notificationsUnreadCountGet) | **GET** /notifications/unread-count | Get unread notification count |


<a id="notificationsGet"></a>
# **notificationsGet**
> NotificationListResponse notificationsGet(page, perPage)

List notifications

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = NotificationsApi()
val page : kotlin.Int = 56 // kotlin.Int | 
val perPage : kotlin.Int = 56 // kotlin.Int | 
try {
    val result : NotificationListResponse = apiInstance.notificationsGet(page, perPage)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling NotificationsApi#notificationsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling NotificationsApi#notificationsGet")
    e.printStackTrace()
}
```

### Parameters
| **page** | **kotlin.Int**|  | [optional] |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **perPage** | **kotlin.Int**|  | [optional] |

### Return type

[**NotificationListResponse**](NotificationListResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="notificationsIdDelete"></a>
# **notificationsIdDelete**
> notificationsIdDelete(id)

Delete notification

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = NotificationsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.notificationsIdDelete(id)
} catch (e: ClientException) {
    println("4xx response calling NotificationsApi#notificationsIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling NotificationsApi#notificationsIdDelete")
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

<a id="notificationsIdReadPut"></a>
# **notificationsIdReadPut**
> notificationsIdReadPut(id)

Mark notification as read

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = NotificationsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.notificationsIdReadPut(id)
} catch (e: ClientException) {
    println("4xx response calling NotificationsApi#notificationsIdReadPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling NotificationsApi#notificationsIdReadPut")
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

<a id="notificationsReadAllPut"></a>
# **notificationsReadAllPut**
> notificationsReadAllPut()

Mark all notifications as read

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = NotificationsApi()
try {
    apiInstance.notificationsReadAllPut()
} catch (e: ClientException) {
    println("4xx response calling NotificationsApi#notificationsReadAllPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling NotificationsApi#notificationsReadAllPut")
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

<a id="notificationsUnreadCountGet"></a>
# **notificationsUnreadCountGet**
> NotificationsUnreadCountGet200Response notificationsUnreadCountGet()

Get unread notification count

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = NotificationsApi()
try {
    val result : NotificationsUnreadCountGet200Response = apiInstance.notificationsUnreadCountGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling NotificationsApi#notificationsUnreadCountGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling NotificationsApi#notificationsUnreadCountGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**NotificationsUnreadCountGet200Response**](NotificationsUnreadCountGet200Response.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

