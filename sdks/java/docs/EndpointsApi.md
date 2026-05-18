# EndpointsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**endpointsGet**](EndpointsApi.md#endpointsGet) | **GET** /endpoints | List all endpoints |
| [**endpointsIdDelete**](EndpointsApi.md#endpointsIdDelete) | **DELETE** /endpoints/{id} | Delete endpoint |
| [**endpointsIdGet**](EndpointsApi.md#endpointsIdGet) | **GET** /endpoints/{id} | Get endpoint by ID |
| [**endpointsIdPut**](EndpointsApi.md#endpointsIdPut) | **PUT** /endpoints/{id} | Update endpoint |
| [**endpointsIdRetryPolicyPut**](EndpointsApi.md#endpointsIdRetryPolicyPut) | **PUT** /endpoints/{id}/retry-policy | Update retry policy for an endpoint |
| [**endpointsIdRotateSecretPost**](EndpointsApi.md#endpointsIdRotateSecretPost) | **POST** /endpoints/{id}/rotate-secret | Rotate endpoint signing secret |
| [**endpointsPost**](EndpointsApi.md#endpointsPost) | **POST** /endpoints | Create a new endpoint |


<a id="endpointsGet"></a>
# **endpointsGet**
> List&lt;Endpoint&gt; endpointsGet()

List all endpoints

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.EndpointsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    EndpointsApi apiInstance = new EndpointsApi(defaultClient);
    try {
      List<Endpoint> result = apiInstance.endpointsGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling EndpointsApi#endpointsGet");
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

[**List&lt;Endpoint&gt;**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Endpoint list |  -  |

<a id="endpointsIdDelete"></a>
# **endpointsIdDelete**
> endpointsIdDelete(id)

Delete endpoint

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.EndpointsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    EndpointsApi apiInstance = new EndpointsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      apiInstance.endpointsIdDelete(id);
    } catch (ApiException e) {
      System.err.println("Exception when calling EndpointsApi#endpointsIdDelete");
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
| **200** | Endpoint deleted |  -  |

<a id="endpointsIdGet"></a>
# **endpointsIdGet**
> Endpoint endpointsIdGet(id)

Get endpoint by ID

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.EndpointsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    EndpointsApi apiInstance = new EndpointsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      Endpoint result = apiInstance.endpointsIdGet(id);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling EndpointsApi#endpointsIdGet");
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

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Endpoint details |  -  |
| **404** | Not found |  -  |

<a id="endpointsIdPut"></a>
# **endpointsIdPut**
> Endpoint endpointsIdPut(id, updateEndpointRequest)

Update endpoint

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.EndpointsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    EndpointsApi apiInstance = new EndpointsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    UpdateEndpointRequest updateEndpointRequest = new UpdateEndpointRequest(); // UpdateEndpointRequest | 
    try {
      Endpoint result = apiInstance.endpointsIdPut(id, updateEndpointRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling EndpointsApi#endpointsIdPut");
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
| **updateEndpointRequest** | [**UpdateEndpointRequest**](UpdateEndpointRequest.md)|  | |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Endpoint updated |  -  |

<a id="endpointsIdRetryPolicyPut"></a>
# **endpointsIdRetryPolicyPut**
> Endpoint endpointsIdRetryPolicyPut(id, retryPolicy)

Update retry policy for an endpoint

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.EndpointsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    EndpointsApi apiInstance = new EndpointsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    RetryPolicy retryPolicy = new RetryPolicy(); // RetryPolicy | 
    try {
      Endpoint result = apiInstance.endpointsIdRetryPolicyPut(id, retryPolicy);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling EndpointsApi#endpointsIdRetryPolicyPut");
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
| **retryPolicy** | [**RetryPolicy**](RetryPolicy.md)|  | |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Retry policy updated |  -  |

<a id="endpointsIdRotateSecretPost"></a>
# **endpointsIdRotateSecretPost**
> EndpointsIdRotateSecretPost200Response endpointsIdRotateSecretPost(id)

Rotate endpoint signing secret

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.EndpointsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    EndpointsApi apiInstance = new EndpointsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      EndpointsIdRotateSecretPost200Response result = apiInstance.endpointsIdRotateSecretPost(id);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling EndpointsApi#endpointsIdRotateSecretPost");
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

[**EndpointsIdRotateSecretPost200Response**](EndpointsIdRotateSecretPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Secret rotated |  -  |

<a id="endpointsPost"></a>
# **endpointsPost**
> Endpoint endpointsPost(createEndpointRequest)

Create a new endpoint

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.EndpointsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    EndpointsApi apiInstance = new EndpointsApi(defaultClient);
    CreateEndpointRequest createEndpointRequest = new CreateEndpointRequest(); // CreateEndpointRequest | 
    try {
      Endpoint result = apiInstance.endpointsPost(createEndpointRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling EndpointsApi#endpointsPost");
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
| **createEndpointRequest** | [**CreateEndpointRequest**](CreateEndpointRequest.md)|  | |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Endpoint created |  -  |

