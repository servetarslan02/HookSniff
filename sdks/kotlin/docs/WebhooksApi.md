# WebhooksApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**webhooksBatchPost**](WebhooksApi.md#webhooksBatchPost) | **POST** /webhooks/batch | Send multiple webhooks in batch |
| [**webhooksBatchReplayPost**](WebhooksApi.md#webhooksBatchReplayPost) | **POST** /webhooks/batch/replay | Replay multiple deliveries by ID |
| [**webhooksExportGet**](WebhooksApi.md#webhooksExportGet) | **GET** /webhooks/export | Export deliveries as CSV |
| [**webhooksGet**](WebhooksApi.md#webhooksGet) | **GET** /webhooks | List webhook deliveries |
| [**webhooksIdAttemptsGet**](WebhooksApi.md#webhooksIdAttemptsGet) | **GET** /webhooks/{id}/attempts | Get delivery attempts |
| [**webhooksIdGet**](WebhooksApi.md#webhooksIdGet) | **GET** /webhooks/{id} | Get delivery by ID |
| [**webhooksIdReplayPost**](WebhooksApi.md#webhooksIdReplayPost) | **POST** /webhooks/{id}/replay | Replay a single delivery |
| [**webhooksPost**](WebhooksApi.md#webhooksPost) | **POST** /webhooks | Send a webhook |


<a id="webhooksBatchPost"></a>
# **webhooksBatchPost**
> BatchResponse webhooksBatchPost(batchWebhookRequest)

Send multiple webhooks in batch

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = WebhooksApi()
val batchWebhookRequest : BatchWebhookRequest =  // BatchWebhookRequest | 
try {
    val result : BatchResponse = apiInstance.webhooksBatchPost(batchWebhookRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling WebhooksApi#webhooksBatchPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling WebhooksApi#webhooksBatchPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **batchWebhookRequest** | [**BatchWebhookRequest**](BatchWebhookRequest.md)|  | |

### Return type

[**BatchResponse**](BatchResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="webhooksBatchReplayPost"></a>
# **webhooksBatchReplayPost**
> webhooksBatchReplayPost(batchReplayRequest)

Replay multiple deliveries by ID

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = WebhooksApi()
val batchReplayRequest : BatchReplayRequest =  // BatchReplayRequest | 
try {
    apiInstance.webhooksBatchReplayPost(batchReplayRequest)
} catch (e: ClientException) {
    println("4xx response calling WebhooksApi#webhooksBatchReplayPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling WebhooksApi#webhooksBatchReplayPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **batchReplayRequest** | [**BatchReplayRequest**](BatchReplayRequest.md)|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="webhooksExportGet"></a>
# **webhooksExportGet**
> kotlin.String webhooksExportGet(range)

Export deliveries as CSV

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = WebhooksApi()
val range : kotlin.String = range_example // kotlin.String | 
try {
    val result : kotlin.String = apiInstance.webhooksExportGet(range)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling WebhooksApi#webhooksExportGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling WebhooksApi#webhooksExportGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **range** | **kotlin.String**|  | [optional] [default to Range._7d] [enum: 24h, 7d, 30d] |

### Return type

**kotlin.String**

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="webhooksGet"></a>
# **webhooksGet**
> DeliveryListResponse webhooksGet(page, perPage, status, endpointId)

List webhook deliveries

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = WebhooksApi()
val page : kotlin.Int = 56 // kotlin.Int | 
val perPage : kotlin.Int = 56 // kotlin.Int | 
val status : kotlin.String = status_example // kotlin.String | 
val endpointId : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : DeliveryListResponse = apiInstance.webhooksGet(page, perPage, status, endpointId)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling WebhooksApi#webhooksGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling WebhooksApi#webhooksGet")
    e.printStackTrace()
}
```

### Parameters
| **page** | **kotlin.Int**|  | [optional] [default to 1] |
| **perPage** | **kotlin.Int**|  | [optional] [default to 20] |
| **status** | **kotlin.String**|  | [optional] [enum: pending, processing, delivered, failed] |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **endpointId** | **java.util.UUID**|  | [optional] |

### Return type

[**DeliveryListResponse**](DeliveryListResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="webhooksIdAttemptsGet"></a>
# **webhooksIdAttemptsGet**
> kotlin.collections.List&lt;DeliveryAttempt&gt; webhooksIdAttemptsGet(id)

Get delivery attempts

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = WebhooksApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : kotlin.collections.List<DeliveryAttempt> = apiInstance.webhooksIdAttemptsGet(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling WebhooksApi#webhooksIdAttemptsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling WebhooksApi#webhooksIdAttemptsGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**kotlin.collections.List&lt;DeliveryAttempt&gt;**](DeliveryAttempt.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="webhooksIdGet"></a>
# **webhooksIdGet**
> Delivery webhooksIdGet(id)

Get delivery by ID

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = WebhooksApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : Delivery = apiInstance.webhooksIdGet(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling WebhooksApi#webhooksIdGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling WebhooksApi#webhooksIdGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**Delivery**](Delivery.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="webhooksIdReplayPost"></a>
# **webhooksIdReplayPost**
> Delivery webhooksIdReplayPost(id)

Replay a single delivery

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = WebhooksApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : Delivery = apiInstance.webhooksIdReplayPost(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling WebhooksApi#webhooksIdReplayPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling WebhooksApi#webhooksIdReplayPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**Delivery**](Delivery.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="webhooksPost"></a>
# **webhooksPost**
> Delivery webhooksPost(createWebhookRequest)

Send a webhook

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = WebhooksApi()
val createWebhookRequest : CreateWebhookRequest =  // CreateWebhookRequest | 
try {
    val result : Delivery = apiInstance.webhooksPost(createWebhookRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling WebhooksApi#webhooksPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling WebhooksApi#webhooksPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **createWebhookRequest** | [**CreateWebhookRequest**](CreateWebhookRequest.md)|  | |

### Return type

[**Delivery**](Delivery.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

