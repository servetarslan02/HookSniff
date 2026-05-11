# SearchApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**searchGet**](SearchApi.md#searchGet) | **GET** /search | Search deliveries |


<a id="searchGet"></a>
# **searchGet**
> SearchResult searchGet(q, status, endpointId, page, perPage)

Search deliveries

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.SearchApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    SearchApi apiInstance = new SearchApi(defaultClient);
    String q = "q_example"; // String | 
    String status = "status_example"; // String | 
    UUID endpointId = UUID.randomUUID(); // UUID | 
    Integer page = 56; // Integer | 
    Integer perPage = 56; // Integer | 
    try {
      SearchResult result = apiInstance.searchGet(q, status, endpointId, page, perPage);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling SearchApi#searchGet");
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
| **q** | **String**|  | |
| **status** | **String**|  | [optional] |
| **endpointId** | **UUID**|  | [optional] |
| **page** | **Integer**|  | [optional] |
| **perPage** | **Integer**|  | [optional] |

### Return type

[**SearchResult**](SearchResult.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Search results |  -  |

