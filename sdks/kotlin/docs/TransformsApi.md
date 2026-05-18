# TransformsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**endpointsEndpointIdTransformsGet**](TransformsApi.md#endpointsEndpointIdTransformsGet) | **GET** /endpoints/{endpoint_id}/transforms | List transform rules for endpoint |
| [**endpointsEndpointIdTransformsIdDelete**](TransformsApi.md#endpointsEndpointIdTransformsIdDelete) | **DELETE** /endpoints/{endpoint_id}/transforms/{id} | Delete transform rule |
| [**endpointsEndpointIdTransformsIdPut**](TransformsApi.md#endpointsEndpointIdTransformsIdPut) | **PUT** /endpoints/{endpoint_id}/transforms/{id} | Update transform rule |
| [**endpointsEndpointIdTransformsPost**](TransformsApi.md#endpointsEndpointIdTransformsPost) | **POST** /endpoints/{endpoint_id}/transforms | Create transform rule |
| [**endpointsEndpointIdTransformsTestPost**](TransformsApi.md#endpointsEndpointIdTransformsTestPost) | **POST** /endpoints/{endpoint_id}/transforms/test | Test a transform rule |


<a id="endpointsEndpointIdTransformsGet"></a>
# **endpointsEndpointIdTransformsGet**
> kotlin.collections.List&lt;TransformRule&gt; endpointsEndpointIdTransformsGet(endpointId)

List transform rules for endpoint

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TransformsApi()
val endpointId : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : kotlin.collections.List<TransformRule> = apiInstance.endpointsEndpointIdTransformsGet(endpointId)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling TransformsApi#endpointsEndpointIdTransformsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TransformsApi#endpointsEndpointIdTransformsGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **endpointId** | **java.util.UUID**|  | |

### Return type

[**kotlin.collections.List&lt;TransformRule&gt;**](TransformRule.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="endpointsEndpointIdTransformsIdDelete"></a>
# **endpointsEndpointIdTransformsIdDelete**
> endpointsEndpointIdTransformsIdDelete(endpointId, id)

Delete transform rule

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TransformsApi()
val endpointId : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.endpointsEndpointIdTransformsIdDelete(endpointId, id)
} catch (e: ClientException) {
    println("4xx response calling TransformsApi#endpointsEndpointIdTransformsIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TransformsApi#endpointsEndpointIdTransformsIdDelete")
    e.printStackTrace()
}
```

### Parameters
| **endpointId** | **java.util.UUID**|  | |
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

<a id="endpointsEndpointIdTransformsIdPut"></a>
# **endpointsEndpointIdTransformsIdPut**
> TransformRule endpointsEndpointIdTransformsIdPut(endpointId, id, body)

Update transform rule

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TransformsApi()
val endpointId : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val body : kotlin.Any = Object // kotlin.Any | 
try {
    val result : TransformRule = apiInstance.endpointsEndpointIdTransformsIdPut(endpointId, id, body)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling TransformsApi#endpointsEndpointIdTransformsIdPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TransformsApi#endpointsEndpointIdTransformsIdPut")
    e.printStackTrace()
}
```

### Parameters
| **endpointId** | **java.util.UUID**|  | |
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **body** | **kotlin.Any**|  | |

### Return type

[**TransformRule**](TransformRule.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="endpointsEndpointIdTransformsPost"></a>
# **endpointsEndpointIdTransformsPost**
> TransformRule endpointsEndpointIdTransformsPost(endpointId, createTransformRuleRequest)

Create transform rule

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TransformsApi()
val endpointId : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val createTransformRuleRequest : CreateTransformRuleRequest =  // CreateTransformRuleRequest | 
try {
    val result : TransformRule = apiInstance.endpointsEndpointIdTransformsPost(endpointId, createTransformRuleRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling TransformsApi#endpointsEndpointIdTransformsPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TransformsApi#endpointsEndpointIdTransformsPost")
    e.printStackTrace()
}
```

### Parameters
| **endpointId** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **createTransformRuleRequest** | [**CreateTransformRuleRequest**](CreateTransformRuleRequest.md)|  | |

### Return type

[**TransformRule**](TransformRule.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="endpointsEndpointIdTransformsTestPost"></a>
# **endpointsEndpointIdTransformsTestPost**
> endpointsEndpointIdTransformsTestPost(endpointId, endpointsEndpointIdTransformsTestPostRequest)

Test a transform rule

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TransformsApi()
val endpointId : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val endpointsEndpointIdTransformsTestPostRequest : EndpointsEndpointIdTransformsTestPostRequest =  // EndpointsEndpointIdTransformsTestPostRequest | 
try {
    apiInstance.endpointsEndpointIdTransformsTestPost(endpointId, endpointsEndpointIdTransformsTestPostRequest)
} catch (e: ClientException) {
    println("4xx response calling TransformsApi#endpointsEndpointIdTransformsTestPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TransformsApi#endpointsEndpointIdTransformsTestPost")
    e.printStackTrace()
}
```

### Parameters
| **endpointId** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **endpointsEndpointIdTransformsTestPostRequest** | [**EndpointsEndpointIdTransformsTestPostRequest**](EndpointsEndpointIdTransformsTestPostRequest.md)|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

