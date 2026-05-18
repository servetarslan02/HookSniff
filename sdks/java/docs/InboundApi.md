# InboundApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**inboundConfigsGet**](InboundApi.md#inboundConfigsGet) | **GET** /inbound/configs | List inbound webhook configs |
| [**inboundConfigsIdDelete**](InboundApi.md#inboundConfigsIdDelete) | **DELETE** /inbound/configs/{id} | Delete inbound config |
| [**inboundConfigsIdPut**](InboundApi.md#inboundConfigsIdPut) | **PUT** /inbound/configs/{id} | Update inbound config |
| [**inboundConfigsPost**](InboundApi.md#inboundConfigsPost) | **POST** /inbound/configs | Create inbound webhook config |
| [**inboundProviderEndpointIdPost**](InboundApi.md#inboundProviderEndpointIdPost) | **POST** /inbound/{provider}/{endpoint_id} | Receive inbound webhook for a specific endpoint |
| [**inboundProviderPost**](InboundApi.md#inboundProviderPost) | **POST** /inbound/{provider} | Receive inbound webhook from a provider |


<a id="inboundConfigsGet"></a>
# **inboundConfigsGet**
> List&lt;InboundConfig&gt; inboundConfigsGet()

List inbound webhook configs

Returns all inbound webhook configurations for the authenticated user

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.InboundApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    InboundApi apiInstance = new InboundApi(defaultClient);
    try {
      List<InboundConfig> result = apiInstance.inboundConfigsGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling InboundApi#inboundConfigsGet");
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

[**List&lt;InboundConfig&gt;**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of inbound configs |  -  |
| **401** |  |  -  |

<a id="inboundConfigsIdDelete"></a>
# **inboundConfigsIdDelete**
> inboundConfigsIdDelete(id)

Delete inbound config

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.InboundApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    InboundApi apiInstance = new InboundApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      apiInstance.inboundConfigsIdDelete(id);
    } catch (ApiException e) {
      System.err.println("Exception when calling InboundApi#inboundConfigsIdDelete");
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
| **200** | Config deleted |  -  |
| **404** |  |  -  |

<a id="inboundConfigsIdPut"></a>
# **inboundConfigsIdPut**
> InboundConfig inboundConfigsIdPut(id, inboundConfigsIdPutRequest)

Update inbound config

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.InboundApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    InboundApi apiInstance = new InboundApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    InboundConfigsIdPutRequest inboundConfigsIdPutRequest = new InboundConfigsIdPutRequest(); // InboundConfigsIdPutRequest | 
    try {
      InboundConfig result = apiInstance.inboundConfigsIdPut(id, inboundConfigsIdPutRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling InboundApi#inboundConfigsIdPut");
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
| **inboundConfigsIdPutRequest** | [**InboundConfigsIdPutRequest**](InboundConfigsIdPutRequest.md)|  | [optional] |

### Return type

[**InboundConfig**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Config updated |  -  |
| **404** |  |  -  |

<a id="inboundConfigsPost"></a>
# **inboundConfigsPost**
> InboundConfig inboundConfigsPost(inboundConfigsPostRequest)

Create inbound webhook config

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.InboundApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    InboundApi apiInstance = new InboundApi(defaultClient);
    InboundConfigsPostRequest inboundConfigsPostRequest = new InboundConfigsPostRequest(); // InboundConfigsPostRequest | 
    try {
      InboundConfig result = apiInstance.inboundConfigsPost(inboundConfigsPostRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling InboundApi#inboundConfigsPost");
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
| **inboundConfigsPostRequest** | [**InboundConfigsPostRequest**](InboundConfigsPostRequest.md)|  | |

### Return type

[**InboundConfig**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Config created |  -  |
| **400** | Validation error |  -  |
| **401** |  |  -  |

<a id="inboundProviderEndpointIdPost"></a>
# **inboundProviderEndpointIdPost**
> inboundProviderEndpointIdPost(provider, endpointId, body)

Receive inbound webhook for a specific endpoint

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.InboundApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    InboundApi apiInstance = new InboundApi(defaultClient);
    String provider = "provider_example"; // String | 
    UUID endpointId = UUID.randomUUID(); // UUID | 
    Object body = null; // Object | 
    try {
      apiInstance.inboundProviderEndpointIdPost(provider, endpointId, body);
    } catch (ApiException e) {
      System.err.println("Exception when calling InboundApi#inboundProviderEndpointIdPost");
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
| **provider** | **String**|  | |
| **endpointId** | **UUID**|  | |
| **body** | **Object**|  | |

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
| **200** | Webhook accepted |  -  |

<a id="inboundProviderPost"></a>
# **inboundProviderPost**
> inboundProviderPost(provider, body)

Receive inbound webhook from a provider

Accepts webhooks from external providers (Stripe, GitHub, etc.) and routes them to the customer&#39;s endpoints. 

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.InboundApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    InboundApi apiInstance = new InboundApi(defaultClient);
    String provider = "provider_example"; // String | 
    Object body = null; // Object | 
    try {
      apiInstance.inboundProviderPost(provider, body);
    } catch (ApiException e) {
      System.err.println("Exception when calling InboundApi#inboundProviderPost");
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
| **provider** | **String**|  | |
| **body** | **Object**|  | |

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
| **200** | Webhook accepted |  -  |
| **400** | Invalid payload |  -  |

