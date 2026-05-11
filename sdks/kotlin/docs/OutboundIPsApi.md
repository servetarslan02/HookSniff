# OutboundIPsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**outboundIpsGet**](OutboundIPsApi.md#outboundIpsGet) | **GET** /outbound-ips | Get outbound IP addresses for firewall whitelisting |


<a id="outboundIpsGet"></a>
# **outboundIpsGet**
> OutboundIpsResponse outboundIpsGet()

Get outbound IP addresses for firewall whitelisting

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = OutboundIPsApi()
try {
    val result : OutboundIpsResponse = apiInstance.outboundIpsGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling OutboundIPsApi#outboundIpsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling OutboundIPsApi#outboundIpsGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**OutboundIpsResponse**](OutboundIpsResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

