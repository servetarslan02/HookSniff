# AlertsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**alertsGet**](AlertsApi.md#alertsGet) | **GET** /alerts | List alert rules |
| [**alertsIdDelete**](AlertsApi.md#alertsIdDelete) | **DELETE** /alerts/{id} | Delete alert rule |
| [**alertsIdGet**](AlertsApi.md#alertsIdGet) | **GET** /alerts/{id} | Get alert rule |
| [**alertsIdTestPost**](AlertsApi.md#alertsIdTestPost) | **POST** /alerts/{id}/test | Test an alert rule |
| [**alertsPost**](AlertsApi.md#alertsPost) | **POST** /alerts | Create alert rule |


<a id="alertsGet"></a>
# **alertsGet**
> kotlin.collections.List&lt;AlertRule&gt; alertsGet()

List alert rules

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AlertsApi()
try {
    val result : kotlin.collections.List<AlertRule> = apiInstance.alertsGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AlertsApi#alertsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AlertsApi#alertsGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**kotlin.collections.List&lt;AlertRule&gt;**](AlertRule.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="alertsIdDelete"></a>
# **alertsIdDelete**
> alertsIdDelete(id)

Delete alert rule

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AlertsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.alertsIdDelete(id)
} catch (e: ClientException) {
    println("4xx response calling AlertsApi#alertsIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AlertsApi#alertsIdDelete")
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

<a id="alertsIdGet"></a>
# **alertsIdGet**
> AlertRule alertsIdGet(id)

Get alert rule

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AlertsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : AlertRule = apiInstance.alertsIdGet(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AlertsApi#alertsIdGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AlertsApi#alertsIdGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**AlertRule**](AlertRule.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="alertsIdTestPost"></a>
# **alertsIdTestPost**
> alertsIdTestPost(id)

Test an alert rule

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AlertsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.alertsIdTestPost(id)
} catch (e: ClientException) {
    println("4xx response calling AlertsApi#alertsIdTestPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AlertsApi#alertsIdTestPost")
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

<a id="alertsPost"></a>
# **alertsPost**
> AlertRule alertsPost(createAlertRequest)

Create alert rule

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AlertsApi()
val createAlertRequest : CreateAlertRequest =  // CreateAlertRequest | 
try {
    val result : AlertRule = apiInstance.alertsPost(createAlertRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AlertsApi#alertsPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AlertsApi#alertsPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **createAlertRequest** | [**CreateAlertRequest**](CreateAlertRequest.md)|  | |

### Return type

[**AlertRule**](AlertRule.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

