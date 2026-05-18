# EndpointsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**endpointsGet**](EndpointsApi.md#endpointsGet) | **GET** /endpoints | List all endpoints |
| [**endpointsIdDelete**](EndpointsApi.md#endpointsIdDelete) | **DELETE** /endpoints/{id} | Delete endpoint |
| [**endpointsIdGet**](EndpointsApi.md#endpointsIdGet) | **GET** /endpoints/{id} | Get endpoint by ID |
| [**endpointsIdPut**](EndpointsApi.md#endpointsIdPut) | **PUT** /endpoints/{id} | Update endpoint |
| [**endpointsIdRetryPolicyPut**](EndpointsApi.md#endpointsIdRetryPolicyPut) | **PUT** /endpoints/{id}/retry-policy | Update retry policy for an endpoint |
| [**endpointsIdRotateSecretPost**](EndpointsApi.md#endpointsIdRotateSecretPost) | **POST** /endpoints/{id}/rotate-secret | Rotate endpoint signing secret |
| [**endpointsPost**](EndpointsApi.md#endpointsPost) | **POST** /endpoints | Create a new endpoint |


<a id="endpointsGet"></a>
# **endpointsGet**
> kotlin.collections.List&lt;Endpoint&gt; endpointsGet()

List all endpoints

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = EndpointsApi()
try {
    val result : kotlin.collections.List<Endpoint> = apiInstance.endpointsGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling EndpointsApi#endpointsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling EndpointsApi#endpointsGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**kotlin.collections.List&lt;Endpoint&gt;**](Endpoint.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="endpointsIdDelete"></a>
# **endpointsIdDelete**
> endpointsIdDelete(id)

Delete endpoint

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = EndpointsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.endpointsIdDelete(id)
} catch (e: ClientException) {
    println("4xx response calling EndpointsApi#endpointsIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling EndpointsApi#endpointsIdDelete")
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

<a id="endpointsIdGet"></a>
# **endpointsIdGet**
> Endpoint endpointsIdGet(id)

Get endpoint by ID

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = EndpointsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : Endpoint = apiInstance.endpointsIdGet(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling EndpointsApi#endpointsIdGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling EndpointsApi#endpointsIdGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="endpointsIdPut"></a>
# **endpointsIdPut**
> Endpoint endpointsIdPut(id, updateEndpointRequest)

Update endpoint

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = EndpointsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val updateEndpointRequest : UpdateEndpointRequest =  // UpdateEndpointRequest | 
try {
    val result : Endpoint = apiInstance.endpointsIdPut(id, updateEndpointRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling EndpointsApi#endpointsIdPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling EndpointsApi#endpointsIdPut")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **updateEndpointRequest** | [**UpdateEndpointRequest**](UpdateEndpointRequest.md)|  | |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="endpointsIdRetryPolicyPut"></a>
# **endpointsIdRetryPolicyPut**
> Endpoint endpointsIdRetryPolicyPut(id, retryPolicy)

Update retry policy for an endpoint

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = EndpointsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val retryPolicy : RetryPolicy =  // RetryPolicy | 
try {
    val result : Endpoint = apiInstance.endpointsIdRetryPolicyPut(id, retryPolicy)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling EndpointsApi#endpointsIdRetryPolicyPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling EndpointsApi#endpointsIdRetryPolicyPut")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **retryPolicy** | [**RetryPolicy**](RetryPolicy.md)|  | |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="endpointsIdRotateSecretPost"></a>
# **endpointsIdRotateSecretPost**
> EndpointsIdRotateSecretPost200Response endpointsIdRotateSecretPost(id)

Rotate endpoint signing secret

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = EndpointsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : EndpointsIdRotateSecretPost200Response = apiInstance.endpointsIdRotateSecretPost(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling EndpointsApi#endpointsIdRotateSecretPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling EndpointsApi#endpointsIdRotateSecretPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**EndpointsIdRotateSecretPost200Response**](EndpointsIdRotateSecretPost200Response.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="endpointsPost"></a>
# **endpointsPost**
> Endpoint endpointsPost(createEndpointRequest)

Create a new endpoint

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = EndpointsApi()
val createEndpointRequest : CreateEndpointRequest =  // CreateEndpointRequest | 
try {
    val result : Endpoint = apiInstance.endpointsPost(createEndpointRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling EndpointsApi#endpointsPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling EndpointsApi#endpointsPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **createEndpointRequest** | [**CreateEndpointRequest**](CreateEndpointRequest.md)|  | |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

