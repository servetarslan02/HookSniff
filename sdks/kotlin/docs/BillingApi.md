# BillingApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**billingInvoicesGet**](BillingApi.md#billingInvoicesGet) | **GET** /billing/invoices | List invoices |
| [**billingPortalPost**](BillingApi.md#billingPortalPost) | **POST** /billing/portal | Open customer billing portal |
| [**billingSubscriptionGet**](BillingApi.md#billingSubscriptionGet) | **GET** /billing/subscription | Get current subscription |
| [**billingUpgradePost**](BillingApi.md#billingUpgradePost) | **POST** /billing/upgrade | Upgrade plan |
| [**billingUsageGet**](BillingApi.md#billingUsageGet) | **GET** /billing/usage | Get current usage |
| [**billingWebhookIyzicoPost**](BillingApi.md#billingWebhookIyzicoPost) | **POST** /billing/webhook/iyzico | iyzico webhook receiver |
| [**billingWebhookPolarPost**](BillingApi.md#billingWebhookPolarPost) | **POST** /billing/webhook/polar | Polar.sh webhook receiver |
| [**billingWebhookPost**](BillingApi.md#billingWebhookPost) | **POST** /billing/webhook | Stripe webhook receiver |


<a id="billingInvoicesGet"></a>
# **billingInvoicesGet**
> kotlin.collections.List&lt;InvoiceResponse&gt; billingInvoicesGet()

List invoices

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = BillingApi()
try {
    val result : kotlin.collections.List<InvoiceResponse> = apiInstance.billingInvoicesGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling BillingApi#billingInvoicesGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling BillingApi#billingInvoicesGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**kotlin.collections.List&lt;InvoiceResponse&gt;**](InvoiceResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="billingPortalPost"></a>
# **billingPortalPost**
> BillingPortalPost200Response billingPortalPost()

Open customer billing portal

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = BillingApi()
try {
    val result : BillingPortalPost200Response = apiInstance.billingPortalPost()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling BillingApi#billingPortalPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling BillingApi#billingPortalPost")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**BillingPortalPost200Response**](BillingPortalPost200Response.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="billingSubscriptionGet"></a>
# **billingSubscriptionGet**
> SubscriptionResponse billingSubscriptionGet()

Get current subscription

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = BillingApi()
try {
    val result : SubscriptionResponse = apiInstance.billingSubscriptionGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling BillingApi#billingSubscriptionGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling BillingApi#billingSubscriptionGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**SubscriptionResponse**](SubscriptionResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="billingUpgradePost"></a>
# **billingUpgradePost**
> UpgradeResponse billingUpgradePost(upgradeRequest)

Upgrade plan

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = BillingApi()
val upgradeRequest : UpgradeRequest =  // UpgradeRequest | 
try {
    val result : UpgradeResponse = apiInstance.billingUpgradePost(upgradeRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling BillingApi#billingUpgradePost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling BillingApi#billingUpgradePost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **upgradeRequest** | [**UpgradeRequest**](UpgradeRequest.md)|  | |

### Return type

[**UpgradeResponse**](UpgradeResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="billingUsageGet"></a>
# **billingUsageGet**
> UsageResponse billingUsageGet()

Get current usage

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = BillingApi()
try {
    val result : UsageResponse = apiInstance.billingUsageGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling BillingApi#billingUsageGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling BillingApi#billingUsageGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**UsageResponse**](UsageResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="billingWebhookIyzicoPost"></a>
# **billingWebhookIyzicoPost**
> billingWebhookIyzicoPost(body)

iyzico webhook receiver

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = BillingApi()
val body : kotlin.Any = Object // kotlin.Any | 
try {
    apiInstance.billingWebhookIyzicoPost(body)
} catch (e: ClientException) {
    println("4xx response calling BillingApi#billingWebhookIyzicoPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling BillingApi#billingWebhookIyzicoPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **body** | **kotlin.Any**|  | |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="billingWebhookPolarPost"></a>
# **billingWebhookPolarPost**
> billingWebhookPolarPost(body)

Polar.sh webhook receiver

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = BillingApi()
val body : kotlin.Any = Object // kotlin.Any | 
try {
    apiInstance.billingWebhookPolarPost(body)
} catch (e: ClientException) {
    println("4xx response calling BillingApi#billingWebhookPolarPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling BillingApi#billingWebhookPolarPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **body** | **kotlin.Any**|  | |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="billingWebhookPost"></a>
# **billingWebhookPost**
> billingWebhookPost(body)

Stripe webhook receiver

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = BillingApi()
val body : kotlin.Any = Object // kotlin.Any | 
try {
    apiInstance.billingWebhookPost(body)
} catch (e: ClientException) {
    println("4xx response calling BillingApi#billingWebhookPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling BillingApi#billingWebhookPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **body** | **kotlin.Any**|  | |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

