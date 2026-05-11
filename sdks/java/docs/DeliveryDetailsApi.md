# DeliveryDetailsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**webhooksIdAttemptsAttemptIdGet**](DeliveryDetailsApi.md#webhooksIdAttemptsAttemptIdGet) | **GET** /webhooks/{id}/attempts/{attempt_id} | Get specific attempt detail |
| [**webhooksIdDetailsGet**](DeliveryDetailsApi.md#webhooksIdDetailsGet) | **GET** /webhooks/{id}/details | Get detailed delivery info |


<a id="webhooksIdAttemptsAttemptIdGet"></a>
# **webhooksIdAttemptsAttemptIdGet**
> webhooksIdAttemptsAttemptIdGet(id, attemptId)

Get specific attempt detail

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.DeliveryDetailsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    DeliveryDetailsApi apiInstance = new DeliveryDetailsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    UUID attemptId = UUID.randomUUID(); // UUID | 
    try {
      apiInstance.webhooksIdAttemptsAttemptIdGet(id, attemptId);
    } catch (ApiException e) {
      System.err.println("Exception when calling DeliveryDetailsApi#webhooksIdAttemptsAttemptIdGet");
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
| **attemptId** | **UUID**|  | |

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
| **200** | Attempt details |  -  |

<a id="webhooksIdDetailsGet"></a>
# **webhooksIdDetailsGet**
> webhooksIdDetailsGet(id)

Get detailed delivery info

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.DeliveryDetailsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    DeliveryDetailsApi apiInstance = new DeliveryDetailsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      apiInstance.webhooksIdDetailsGet(id);
    } catch (ApiException e) {
      System.err.println("Exception when calling DeliveryDetailsApi#webhooksIdDetailsGet");
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

null (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Full delivery details |  -  |

