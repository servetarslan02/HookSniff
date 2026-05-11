# DeliveryDetailsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**webhooksIdAttemptsAttemptIdGet**](DeliveryDetailsApi.md#webhooksIdAttemptsAttemptIdGet) | **GET** /webhooks/{id}/attempts/{attempt_id} | Get specific attempt detail |
| [**webhooksIdDetailsGet**](DeliveryDetailsApi.md#webhooksIdDetailsGet) | **GET** /webhooks/{id}/details | Get detailed delivery info |


<a id="webhooksIdAttemptsAttemptIdGet"></a>
# **webhooksIdAttemptsAttemptIdGet**
> webhooksIdAttemptsAttemptIdGet(id, attemptId)

Get specific attempt detail

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = DeliveryDetailsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val attemptId : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.webhooksIdAttemptsAttemptIdGet(id, attemptId)
} catch (e: ClientException) {
    println("4xx response calling DeliveryDetailsApi#webhooksIdAttemptsAttemptIdGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling DeliveryDetailsApi#webhooksIdAttemptsAttemptIdGet")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **attemptId** | **java.util.UUID**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="webhooksIdDetailsGet"></a>
# **webhooksIdDetailsGet**
> webhooksIdDetailsGet(id)

Get detailed delivery info

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = DeliveryDetailsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.webhooksIdDetailsGet(id)
} catch (e: ClientException) {
    println("4xx response calling DeliveryDetailsApi#webhooksIdDetailsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling DeliveryDetailsApi#webhooksIdDetailsGet")
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

