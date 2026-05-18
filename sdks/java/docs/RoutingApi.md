# RoutingApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**endpointsIdHealthGet**](RoutingApi.md#endpointsIdHealthGet) | **GET** /endpoints/{id}/health | Get endpoint health status |
| [**endpointsIdRoutingGet**](RoutingApi.md#endpointsIdRoutingGet) | **GET** /endpoints/{id}/routing | Get routing config for endpoint |
| [**endpointsIdRoutingPut**](RoutingApi.md#endpointsIdRoutingPut) | **PUT** /endpoints/{id}/routing | Update routing config |


<a id="endpointsIdHealthGet"></a>
# **endpointsIdHealthGet**
> EndpointHealth endpointsIdHealthGet(id)

Get endpoint health status

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.RoutingApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    RoutingApi apiInstance = new RoutingApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      EndpointHealth result = apiInstance.endpointsIdHealthGet(id);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling RoutingApi#endpointsIdHealthGet");
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
| **id** | **UUID**|  | |

### Return type

[**EndpointHealth**](EndpointHealth.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Health status |  -  |

<a id="endpointsIdRoutingGet"></a>
# **endpointsIdRoutingGet**
> RoutingInfo endpointsIdRoutingGet(id)

Get routing config for endpoint

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.RoutingApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    RoutingApi apiInstance = new RoutingApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      RoutingInfo result = apiInstance.endpointsIdRoutingGet(id);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling RoutingApi#endpointsIdRoutingGet");
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
| **id** | **UUID**|  | |

### Return type

[**RoutingInfo**](RoutingInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Routing info |  -  |

<a id="endpointsIdRoutingPut"></a>
# **endpointsIdRoutingPut**
> RoutingInfo endpointsIdRoutingPut(id, updateRoutingRequest)

Update routing config

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.RoutingApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    RoutingApi apiInstance = new RoutingApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    UpdateRoutingRequest updateRoutingRequest = new UpdateRoutingRequest(); // UpdateRoutingRequest | 
    try {
      RoutingInfo result = apiInstance.endpointsIdRoutingPut(id, updateRoutingRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling RoutingApi#endpointsIdRoutingPut");
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
| **id** | **UUID**|  | |
| **updateRoutingRequest** | [**UpdateRoutingRequest**](UpdateRoutingRequest.md)|  | |

### Return type

[**RoutingInfo**](RoutingInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Routing updated |  -  |

