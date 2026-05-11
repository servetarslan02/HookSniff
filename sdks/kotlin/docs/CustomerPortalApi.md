# CustomerPortalApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**portalApiKeysGet**](CustomerPortalApi.md#portalApiKeysGet) | **GET** /portal/api-keys | List API keys (portal) |
| [**portalApiKeysKeyIdDelete**](CustomerPortalApi.md#portalApiKeysKeyIdDelete) | **DELETE** /portal/api-keys/{key_id} | Revoke API key (portal) |
| [**portalApiKeysPost**](CustomerPortalApi.md#portalApiKeysPost) | **POST** /portal/api-keys | Create API key (portal) |
| [**portalConfigGet**](CustomerPortalApi.md#portalConfigGet) | **GET** /portal/config | Get portal configuration |
| [**portalConfigPost**](CustomerPortalApi.md#portalConfigPost) | **POST** /portal/config | Update portal configuration |
| [**portalEmbedCodeGet**](CustomerPortalApi.md#portalEmbedCodeGet) | **GET** /portal/embed-code | Get portal embed code |
| [**portalMeGet**](CustomerPortalApi.md#portalMeGet) | **GET** /portal/me | Get portal profile |
| [**portalMePut**](CustomerPortalApi.md#portalMePut) | **PUT** /portal/me | Update portal profile |
| [**portalNotificationsGet**](CustomerPortalApi.md#portalNotificationsGet) | **GET** /portal/notifications | Get notification preferences (portal) |
| [**portalNotificationsPut**](CustomerPortalApi.md#portalNotificationsPut) | **PUT** /portal/notifications | Update notification preferences (portal) |
| [**portalPlanGet**](CustomerPortalApi.md#portalPlanGet) | **GET** /portal/plan | Get plan info (portal) |
| [**portalUsageGet**](CustomerPortalApi.md#portalUsageGet) | **GET** /portal/usage | Get usage (portal) |


<a id="portalApiKeysGet"></a>
# **portalApiKeysGet**
> kotlin.collections.List&lt;ApiKeyInfo&gt; portalApiKeysGet()

List API keys (portal)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomerPortalApi()
try {
    val result : kotlin.collections.List<ApiKeyInfo> = apiInstance.portalApiKeysGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling CustomerPortalApi#portalApiKeysGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomerPortalApi#portalApiKeysGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**kotlin.collections.List&lt;ApiKeyInfo&gt;**](ApiKeyInfo.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="portalApiKeysKeyIdDelete"></a>
# **portalApiKeysKeyIdDelete**
> portalApiKeysKeyIdDelete(keyId)

Revoke API key (portal)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomerPortalApi()
val keyId : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.portalApiKeysKeyIdDelete(keyId)
} catch (e: ClientException) {
    println("4xx response calling CustomerPortalApi#portalApiKeysKeyIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomerPortalApi#portalApiKeysKeyIdDelete")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **keyId** | **java.util.UUID**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="portalApiKeysPost"></a>
# **portalApiKeysPost**
> CreateApiKeyResponse portalApiKeysPost()

Create API key (portal)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomerPortalApi()
try {
    val result : CreateApiKeyResponse = apiInstance.portalApiKeysPost()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling CustomerPortalApi#portalApiKeysPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomerPortalApi#portalApiKeysPost")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="portalConfigGet"></a>
# **portalConfigGet**
> portalConfigGet()

Get portal configuration

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomerPortalApi()
try {
    apiInstance.portalConfigGet()
} catch (e: ClientException) {
    println("4xx response calling CustomerPortalApi#portalConfigGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomerPortalApi#portalConfigGet")
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

<a id="portalConfigPost"></a>
# **portalConfigPost**
> portalConfigPost()

Update portal configuration

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomerPortalApi()
try {
    apiInstance.portalConfigPost()
} catch (e: ClientException) {
    println("4xx response calling CustomerPortalApi#portalConfigPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomerPortalApi#portalConfigPost")
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

<a id="portalEmbedCodeGet"></a>
# **portalEmbedCodeGet**
> portalEmbedCodeGet()

Get portal embed code

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomerPortalApi()
try {
    apiInstance.portalEmbedCodeGet()
} catch (e: ClientException) {
    println("4xx response calling CustomerPortalApi#portalEmbedCodeGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomerPortalApi#portalEmbedCodeGet")
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

<a id="portalMeGet"></a>
# **portalMeGet**
> PortalProfile portalMeGet()

Get portal profile

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomerPortalApi()
try {
    val result : PortalProfile = apiInstance.portalMeGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling CustomerPortalApi#portalMeGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomerPortalApi#portalMeGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**PortalProfile**](PortalProfile.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="portalMePut"></a>
# **portalMePut**
> portalMePut(updateProfileRequest)

Update portal profile

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomerPortalApi()
val updateProfileRequest : UpdateProfileRequest =  // UpdateProfileRequest | 
try {
    apiInstance.portalMePut(updateProfileRequest)
} catch (e: ClientException) {
    println("4xx response calling CustomerPortalApi#portalMePut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomerPortalApi#portalMePut")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **updateProfileRequest** | [**UpdateProfileRequest**](UpdateProfileRequest.md)|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="portalNotificationsGet"></a>
# **portalNotificationsGet**
> NotificationPreferences portalNotificationsGet()

Get notification preferences (portal)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomerPortalApi()
try {
    val result : NotificationPreferences = apiInstance.portalNotificationsGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling CustomerPortalApi#portalNotificationsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomerPortalApi#portalNotificationsGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**NotificationPreferences**](NotificationPreferences.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="portalNotificationsPut"></a>
# **portalNotificationsPut**
> PortalNotificationsPut200Response portalNotificationsPut(updateNotificationPreferences)

Update notification preferences (portal)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomerPortalApi()
val updateNotificationPreferences : UpdateNotificationPreferences =  // UpdateNotificationPreferences | 
try {
    val result : PortalNotificationsPut200Response = apiInstance.portalNotificationsPut(updateNotificationPreferences)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling CustomerPortalApi#portalNotificationsPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomerPortalApi#portalNotificationsPut")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **updateNotificationPreferences** | [**UpdateNotificationPreferences**](UpdateNotificationPreferences.md)|  | |

### Return type

[**PortalNotificationsPut200Response**](PortalNotificationsPut200Response.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="portalPlanGet"></a>
# **portalPlanGet**
> SubscriptionResponse portalPlanGet()

Get plan info (portal)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomerPortalApi()
try {
    val result : SubscriptionResponse = apiInstance.portalPlanGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling CustomerPortalApi#portalPlanGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomerPortalApi#portalPlanGet")
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

<a id="portalUsageGet"></a>
# **portalUsageGet**
> UsageResponse portalUsageGet()

Get usage (portal)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = CustomerPortalApi()
try {
    val result : UsageResponse = apiInstance.portalUsageGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling CustomerPortalApi#portalUsageGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling CustomerPortalApi#portalUsageGet")
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

