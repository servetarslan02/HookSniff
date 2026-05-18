# OutboundIpsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**outboundIpsGet**](OutboundIpsApi.md#outboundIpsGet) | **GET** /outbound-ips | Get outbound IP addresses for firewall whitelisting |


<a id="outboundIpsGet"></a>
# **outboundIpsGet**
> OutboundIpsResponse outboundIpsGet()

Get outbound IP addresses for firewall whitelisting

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.models.*;
import org.openapitools.client.api.OutboundIpsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");

    OutboundIpsApi apiInstance = new OutboundIpsApi(defaultClient);
    try {
      OutboundIpsResponse result = apiInstance.outboundIpsGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling OutboundIpsApi#outboundIpsGet");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
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

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | IP list |  -  |

