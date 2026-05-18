# AnalyticsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**analyticsDeliveriesGet**](AnalyticsApi.md#analyticsDeliveriesGet) | **GET** /analytics/deliveries | Delivery trend over time |
| [**analyticsLatencyGet**](AnalyticsApi.md#analyticsLatencyGet) | **GET** /analytics/latency | Latency trend over time |
| [**analyticsSuccessRateGet**](AnalyticsApi.md#analyticsSuccessRateGet) | **GET** /analytics/success-rate | Success rate metrics |


<a id="analyticsDeliveriesGet"></a>
# **analyticsDeliveriesGet**
> DeliveryTrendResponse analyticsDeliveriesGet(range)

Delivery trend over time

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AnalyticsApi()
val range : kotlin.String = range_example // kotlin.String | 
try {
    val result : DeliveryTrendResponse = apiInstance.analyticsDeliveriesGet(range)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AnalyticsApi#analyticsDeliveriesGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AnalyticsApi#analyticsDeliveriesGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **range** | **kotlin.String**|  | [optional] [default to Range._24h] [enum: 24h, 7d, 30d] |

### Return type

[**DeliveryTrendResponse**](DeliveryTrendResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="analyticsLatencyGet"></a>
# **analyticsLatencyGet**
> LatencyTrendResponse analyticsLatencyGet(range)

Latency trend over time

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AnalyticsApi()
val range : kotlin.String = range_example // kotlin.String | 
try {
    val result : LatencyTrendResponse = apiInstance.analyticsLatencyGet(range)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AnalyticsApi#analyticsLatencyGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AnalyticsApi#analyticsLatencyGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **range** | **kotlin.String**|  | [optional] [default to Range._24h] [enum: 24h, 7d, 30d] |

### Return type

[**LatencyTrendResponse**](LatencyTrendResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="analyticsSuccessRateGet"></a>
# **analyticsSuccessRateGet**
> SuccessRateResponse analyticsSuccessRateGet(range)

Success rate metrics

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AnalyticsApi()
val range : kotlin.String = range_example // kotlin.String | 
try {
    val result : SuccessRateResponse = apiInstance.analyticsSuccessRateGet(range)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AnalyticsApi#analyticsSuccessRateGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AnalyticsApi#analyticsSuccessRateGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **range** | **kotlin.String**|  | [optional] [default to Range._24h] [enum: 24h, 7d, 30d] |

### Return type

[**SuccessRateResponse**](SuccessRateResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

