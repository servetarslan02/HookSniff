# RateLimitsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**rateLimitsEndpointIdDelete**](RateLimitsApi.md#rateLimitsEndpointIdDelete) | **DELETE** /rate-limits/{endpoint_id} | Delete rate limit for endpoint |
| [**rateLimitsEndpointIdGet**](RateLimitsApi.md#rateLimitsEndpointIdGet) | **GET** /rate-limits/{endpoint_id} | Get rate limit for endpoint |
| [**rateLimitsEndpointIdPost**](RateLimitsApi.md#rateLimitsEndpointIdPost) | **POST** /rate-limits/{endpoint_id} | Set rate limit for endpoint |
| [**rateLimitsGet**](RateLimitsApi.md#rateLimitsGet) | **GET** /rate-limits | List rate limits |


<a id="rateLimitsEndpointIdDelete"></a>
# **rateLimitsEndpointIdDelete**
> rateLimitsEndpointIdDelete(endpointId)

Delete rate limit for endpoint

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.RateLimitsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    RateLimitsApi apiInstance = new RateLimitsApi(defaultClient);
    String endpointId = "endpointId_example"; // String | 
    try {
      apiInstance.rateLimitsEndpointIdDelete(endpointId);
    } catch (ApiException e) {
      System.err.println("Exception when calling RateLimitsApi#rateLimitsEndpointIdDelete");
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
| **endpointId** | **String**|  | |

### Return type

null (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Rate limit deleted |  -  |

<a id="rateLimitsEndpointIdGet"></a>
# **rateLimitsEndpointIdGet**
> rateLimitsEndpointIdGet(endpointId)

Get rate limit for endpoint

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.RateLimitsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    RateLimitsApi apiInstance = new RateLimitsApi(defaultClient);
    String endpointId = "endpointId_example"; // String | 
    try {
      apiInstance.rateLimitsEndpointIdGet(endpointId);
    } catch (ApiException e) {
      System.err.println("Exception when calling RateLimitsApi#rateLimitsEndpointIdGet");
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
| **endpointId** | **String**|  | |

### Return type

null (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Rate limit config |  -  |

<a id="rateLimitsEndpointIdPost"></a>
# **rateLimitsEndpointIdPost**
> rateLimitsEndpointIdPost(endpointId)

Set rate limit for endpoint

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.RateLimitsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    RateLimitsApi apiInstance = new RateLimitsApi(defaultClient);
    String endpointId = "endpointId_example"; // String | 
    try {
      apiInstance.rateLimitsEndpointIdPost(endpointId);
    } catch (ApiException e) {
      System.err.println("Exception when calling RateLimitsApi#rateLimitsEndpointIdPost");
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
| **endpointId** | **String**|  | |

### Return type

null (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Rate limit set |  -  |

<a id="rateLimitsGet"></a>
# **rateLimitsGet**
> rateLimitsGet()

List rate limits

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.RateLimitsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    RateLimitsApi apiInstance = new RateLimitsApi(defaultClient);
    try {
      apiInstance.rateLimitsGet();
    } catch (ApiException e) {
      System.err.println("Exception when calling RateLimitsApi#rateLimitsGet");
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

null (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Rate limit list |  -  |

