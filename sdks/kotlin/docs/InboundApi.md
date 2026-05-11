# InboundApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**inboundProviderEndpointIdPost**](InboundApi.md#inboundProviderEndpointIdPost) | **POST** /inbound/{provider}/{endpoint_id} | Receive inbound webhook for a specific endpoint |
| [**inboundProviderPost**](InboundApi.md#inboundProviderPost) | **POST** /inbound/{provider} | Receive inbound webhook from a provider |


<a id="inboundProviderEndpointIdPost"></a>
# **inboundProviderEndpointIdPost**
> inboundProviderEndpointIdPost(provider, endpointId, body)

Receive inbound webhook for a specific endpoint

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = InboundApi()
val provider : kotlin.String = provider_example // kotlin.String | 
val endpointId : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val body : kotlin.Any = Object // kotlin.Any | 
try {
    apiInstance.inboundProviderEndpointIdPost(provider, endpointId, body)
} catch (e: ClientException) {
    println("4xx response calling InboundApi#inboundProviderEndpointIdPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling InboundApi#inboundProviderEndpointIdPost")
    e.printStackTrace()
}
```

### Parameters
| **provider** | **kotlin.String**|  | |
| **endpointId** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **body** | **kotlin.Any**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="inboundProviderPost"></a>
# **inboundProviderPost**
> inboundProviderPost(provider, body)

Receive inbound webhook from a provider

Accepts webhooks from external providers (Stripe, GitHub, etc.) and routes them to the customer&#39;s endpoints. 

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = InboundApi()
val provider : kotlin.String = provider_example // kotlin.String | 
val body : kotlin.Any = Object // kotlin.Any | 
try {
    apiInstance.inboundProviderPost(provider, body)
} catch (e: ClientException) {
    println("4xx response calling InboundApi#inboundProviderPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling InboundApi#inboundProviderPost")
    e.printStackTrace()
}
```

### Parameters
| **provider** | **kotlin.String**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **body** | **kotlin.Any**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

