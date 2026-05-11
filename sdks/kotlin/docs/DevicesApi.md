# DevicesApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**devicesGet**](DevicesApi.md#devicesGet) | **GET** /devices | List registered devices |
| [**devicesPost**](DevicesApi.md#devicesPost) | **POST** /devices | Register device for push notifications |
| [**devicesTokenDelete**](DevicesApi.md#devicesTokenDelete) | **DELETE** /devices/{token} | Remove device token |


<a id="devicesGet"></a>
# **devicesGet**
> kotlin.collections.List&lt;DeviceTokenResponse&gt; devicesGet()

List registered devices

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = DevicesApi()
try {
    val result : kotlin.collections.List<DeviceTokenResponse> = apiInstance.devicesGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling DevicesApi#devicesGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling DevicesApi#devicesGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**kotlin.collections.List&lt;DeviceTokenResponse&gt;**](DeviceTokenResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="devicesPost"></a>
# **devicesPost**
> DeviceTokenResponse devicesPost(registerDeviceRequest)

Register device for push notifications

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = DevicesApi()
val registerDeviceRequest : RegisterDeviceRequest =  // RegisterDeviceRequest | 
try {
    val result : DeviceTokenResponse = apiInstance.devicesPost(registerDeviceRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling DevicesApi#devicesPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling DevicesApi#devicesPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **registerDeviceRequest** | [**RegisterDeviceRequest**](RegisterDeviceRequest.md)|  | |

### Return type

[**DeviceTokenResponse**](DeviceTokenResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="devicesTokenDelete"></a>
# **devicesTokenDelete**
> devicesTokenDelete(token)

Remove device token

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = DevicesApi()
val token : kotlin.String = token_example // kotlin.String | 
try {
    apiInstance.devicesTokenDelete(token)
} catch (e: ClientException) {
    println("4xx response calling DevicesApi#devicesTokenDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling DevicesApi#devicesTokenDelete")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **token** | **kotlin.String**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

