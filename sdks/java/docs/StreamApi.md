# StreamApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**streamDeliveriesGet**](StreamApi.md#streamDeliveriesGet) | **GET** /stream/deliveries | Real-time delivery event stream (SSE) |


<a id="streamDeliveriesGet"></a>
# **streamDeliveriesGet**
> String streamDeliveriesGet(endpointId, status, limit)

Real-time delivery event stream (SSE)

Server-Sent Events stream of webhook deliveries

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.StreamApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    StreamApi apiInstance = new StreamApi(defaultClient);
    UUID endpointId = UUID.randomUUID(); // UUID | 
    String status = "status_example"; // String | 
    Integer limit = 50; // Integer | 
    try {
      String result = apiInstance.streamDeliveriesGet(endpointId, status, limit);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling StreamApi#streamDeliveriesGet");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters

| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **endpointId** | **UUID**|  | [optional] |
| **status** | **String**|  | [optional] |
| **limit** | **Integer**|  | [optional] [default to 50] |

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/event-stream

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | SSE stream |  -  |

