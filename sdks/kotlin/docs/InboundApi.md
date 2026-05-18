# InboundApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**inboundConfigsGet**](InboundApi.md#inboundConfigsGet) | **GET** /inbound/configs | List inbound webhook configs |
| [**inboundConfigsIdDelete**](InboundApi.md#inboundConfigsIdDelete) | **DELETE** /inbound/configs/{id} | Delete inbound config |
| [**inboundConfigsIdPut**](InboundApi.md#inboundConfigsIdPut) | **PUT** /inbound/configs/{id} | Update inbound config |
| [**inboundConfigsPost**](InboundApi.md#inboundConfigsPost) | **POST** /inbound/configs | Create inbound webhook config |
| [**inboundProviderEndpointIdPost**](InboundApi.md#inboundProviderEndpointIdPost) | **POST** /inbound/{provider}/{endpoint_id} | Receive inbound webhook for a specific endpoint |
| [**inboundProviderPost**](InboundApi.md#inboundProviderPost) | **POST** /inbound/{provider} | Receive inbound webhook from a provider |


<a id="inboundConfigsGet"></a>
# **inboundConfigsGet**
> kotlin.collections.List&lt;InboundConfig&gt; inboundConfigsGet()

List inbound webhook configs

Returns all inbound webhook configurations for the authenticated user

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = InboundApi()
try {
    val result : kotlin.collections.List<InboundConfig> = apiInstance.inboundConfigsGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling InboundApi#inboundConfigsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling InboundApi#inboundConfigsGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**kotlin.collections.List&lt;InboundConfig&gt;**](InboundConfig.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="inboundConfigsIdDelete"></a>
# **inboundConfigsIdDelete**
> inboundConfigsIdDelete(id)

Delete inbound config

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = InboundApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.inboundConfigsIdDelete(id)
} catch (e: ClientException) {
    println("4xx response calling InboundApi#inboundConfigsIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling InboundApi#inboundConfigsIdDelete")
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

<a id="inboundConfigsIdPut"></a>
# **inboundConfigsIdPut**
> InboundConfig inboundConfigsIdPut(id, inboundConfigsIdPutRequest)

Update inbound config

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = InboundApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val inboundConfigsIdPutRequest : InboundConfigsIdPutRequest =  // InboundConfigsIdPutRequest | 
try {
    val result : InboundConfig = apiInstance.inboundConfigsIdPut(id, inboundConfigsIdPutRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling InboundApi#inboundConfigsIdPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling InboundApi#inboundConfigsIdPut")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **inboundConfigsIdPutRequest** | [**InboundConfigsIdPutRequest**](InboundConfigsIdPutRequest.md)|  | [optional] |

### Return type

[**InboundConfig**](InboundConfig.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="inboundConfigsPost"></a>
# **inboundConfigsPost**
> InboundConfig inboundConfigsPost(inboundConfigsPostRequest)

Create inbound webhook config

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = InboundApi()
val inboundConfigsPostRequest : InboundConfigsPostRequest =  // InboundConfigsPostRequest | 
try {
    val result : InboundConfig = apiInstance.inboundConfigsPost(inboundConfigsPostRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling InboundApi#inboundConfigsPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling InboundApi#inboundConfigsPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **inboundConfigsPostRequest** | [**InboundConfigsPostRequest**](InboundConfigsPostRequest.md)|  | |

### Return type

[**InboundConfig**](InboundConfig.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

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

