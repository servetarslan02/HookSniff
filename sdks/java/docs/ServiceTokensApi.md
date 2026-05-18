# ServiceTokensApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**serviceTokensGet**](ServiceTokensApi.md#serviceTokensGet) | **GET** /service-tokens | List service tokens |
| [**serviceTokensIdDelete**](ServiceTokensApi.md#serviceTokensIdDelete) | **DELETE** /service-tokens/{id} | Delete service token |
| [**serviceTokensIdPut**](ServiceTokensApi.md#serviceTokensIdPut) | **PUT** /service-tokens/{id} | Update service token |
| [**serviceTokensIdRevealPost**](ServiceTokensApi.md#serviceTokensIdRevealPost) | **POST** /service-tokens/{id}/reveal | Reveal service token |
| [**serviceTokensPost**](ServiceTokensApi.md#serviceTokensPost) | **POST** /service-tokens | Create a service token |


<a id="serviceTokensGet"></a>
# **serviceTokensGet**
> List&lt;ServiceToken&gt; serviceTokensGet()

List service tokens

Returns all service tokens for the authenticated user

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ServiceTokensApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    ServiceTokensApi apiInstance = new ServiceTokensApi(defaultClient);
    try {
      List<ServiceToken> result = apiInstance.serviceTokensGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling ServiceTokensApi#serviceTokensGet");
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

[**List&lt;ServiceToken&gt;**](ServiceToken.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of service tokens |  -  |
| **401** |  |  -  |

<a id="serviceTokensIdDelete"></a>
# **serviceTokensIdDelete**
> serviceTokensIdDelete(id)

Delete service token

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ServiceTokensApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    ServiceTokensApi apiInstance = new ServiceTokensApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      apiInstance.serviceTokensIdDelete(id);
    } catch (ApiException e) {
      System.err.println("Exception when calling ServiceTokensApi#serviceTokensIdDelete");
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
| **200** | Token deleted |  -  |
| **404** |  |  -  |

<a id="serviceTokensIdPut"></a>
# **serviceTokensIdPut**
> serviceTokensIdPut(id, serviceTokensIdPutRequest)

Update service token

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ServiceTokensApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    ServiceTokensApi apiInstance = new ServiceTokensApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    ServiceTokensIdPutRequest serviceTokensIdPutRequest = new ServiceTokensIdPutRequest(); // ServiceTokensIdPutRequest | 
    try {
      apiInstance.serviceTokensIdPut(id, serviceTokensIdPutRequest);
    } catch (ApiException e) {
      System.err.println("Exception when calling ServiceTokensApi#serviceTokensIdPut");
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
| **serviceTokensIdPutRequest** | [**ServiceTokensIdPutRequest**](ServiceTokensIdPutRequest.md)|  | [optional] |

### Return type

null (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Token updated |  -  |
| **404** |  |  -  |

<a id="serviceTokensIdRevealPost"></a>
# **serviceTokensIdRevealPost**
> ServiceTokensIdRevealPost200Response serviceTokensIdRevealPost(id)

Reveal service token

Returns the full token value (only available once after creation, or via this endpoint)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ServiceTokensApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    ServiceTokensApi apiInstance = new ServiceTokensApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      ServiceTokensIdRevealPost200Response result = apiInstance.serviceTokensIdRevealPost(id);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling ServiceTokensApi#serviceTokensIdRevealPost");
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

[**ServiceTokensIdRevealPost200Response**](ServiceTokensIdRevealPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Token revealed |  -  |
| **404** |  |  -  |

<a id="serviceTokensPost"></a>
# **serviceTokensPost**
> ServiceTokenCreateResponse serviceTokensPost(serviceTokensPostRequest)

Create a service token

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ServiceTokensApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    ServiceTokensApi apiInstance = new ServiceTokensApi(defaultClient);
    ServiceTokensPostRequest serviceTokensPostRequest = new ServiceTokensPostRequest(); // ServiceTokensPostRequest | 
    try {
      ServiceTokenCreateResponse result = apiInstance.serviceTokensPost(serviceTokensPostRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling ServiceTokensApi#serviceTokensPost");
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
| **serviceTokensPostRequest** | [**ServiceTokensPostRequest**](ServiceTokensPostRequest.md)|  | |

### Return type

[**ServiceTokenCreateResponse**](ServiceTokenCreateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Token created (full token shown only once) |  -  |
| **401** |  |  -  |

