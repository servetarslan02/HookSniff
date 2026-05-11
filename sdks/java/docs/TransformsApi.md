# TransformsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**endpointsEndpointIdTransformsGet**](TransformsApi.md#endpointsEndpointIdTransformsGet) | **GET** /endpoints/{endpoint_id}/transforms | List transform rules for endpoint |
| [**endpointsEndpointIdTransformsIdDelete**](TransformsApi.md#endpointsEndpointIdTransformsIdDelete) | **DELETE** /endpoints/{endpoint_id}/transforms/{id} | Delete transform rule |
| [**endpointsEndpointIdTransformsIdPut**](TransformsApi.md#endpointsEndpointIdTransformsIdPut) | **PUT** /endpoints/{endpoint_id}/transforms/{id} | Update transform rule |
| [**endpointsEndpointIdTransformsPost**](TransformsApi.md#endpointsEndpointIdTransformsPost) | **POST** /endpoints/{endpoint_id}/transforms | Create transform rule |
| [**endpointsEndpointIdTransformsTestPost**](TransformsApi.md#endpointsEndpointIdTransformsTestPost) | **POST** /endpoints/{endpoint_id}/transforms/test | Test a transform rule |


<a id="endpointsEndpointIdTransformsGet"></a>
# **endpointsEndpointIdTransformsGet**
> List&lt;TransformRule&gt; endpointsEndpointIdTransformsGet(endpointId)

List transform rules for endpoint

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.TransformsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    TransformsApi apiInstance = new TransformsApi(defaultClient);
    UUID endpointId = UUID.randomUUID(); // UUID | 
    try {
      List<TransformRule> result = apiInstance.endpointsEndpointIdTransformsGet(endpointId);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling TransformsApi#endpointsEndpointIdTransformsGet");
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
| **endpointId** | **UUID**|  | |

### Return type

[**List&lt;TransformRule&gt;**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Transform rule list |  -  |

<a id="endpointsEndpointIdTransformsIdDelete"></a>
# **endpointsEndpointIdTransformsIdDelete**
> endpointsEndpointIdTransformsIdDelete(endpointId, id)

Delete transform rule

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.TransformsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    TransformsApi apiInstance = new TransformsApi(defaultClient);
    UUID endpointId = UUID.randomUUID(); // UUID | 
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      apiInstance.endpointsEndpointIdTransformsIdDelete(endpointId, id);
    } catch (ApiException e) {
      System.err.println("Exception when calling TransformsApi#endpointsEndpointIdTransformsIdDelete");
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
| **endpointId** | **UUID**|  | |
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
| **200** | Rule deleted |  -  |

<a id="endpointsEndpointIdTransformsIdPut"></a>
# **endpointsEndpointIdTransformsIdPut**
> TransformRule endpointsEndpointIdTransformsIdPut(endpointId, id, body)

Update transform rule

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.TransformsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    TransformsApi apiInstance = new TransformsApi(defaultClient);
    UUID endpointId = UUID.randomUUID(); // UUID | 
    UUID id = UUID.randomUUID(); // UUID | 
    Object body = null; // Object | 
    try {
      TransformRule result = apiInstance.endpointsEndpointIdTransformsIdPut(endpointId, id, body);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling TransformsApi#endpointsEndpointIdTransformsIdPut");
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
| **endpointId** | **UUID**|  | |
| **id** | **UUID**|  | |
| **body** | **Object**|  | |

### Return type

[**TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Rule updated |  -  |

<a id="endpointsEndpointIdTransformsPost"></a>
# **endpointsEndpointIdTransformsPost**
> TransformRule endpointsEndpointIdTransformsPost(endpointId, createTransformRuleRequest)

Create transform rule

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.TransformsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    TransformsApi apiInstance = new TransformsApi(defaultClient);
    UUID endpointId = UUID.randomUUID(); // UUID | 
    CreateTransformRuleRequest createTransformRuleRequest = new CreateTransformRuleRequest(); // CreateTransformRuleRequest | 
    try {
      TransformRule result = apiInstance.endpointsEndpointIdTransformsPost(endpointId, createTransformRuleRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling TransformsApi#endpointsEndpointIdTransformsPost");
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
| **endpointId** | **UUID**|  | |
| **createTransformRuleRequest** | [**CreateTransformRuleRequest**](CreateTransformRuleRequest.md)|  | |

### Return type

[**TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Rule created |  -  |

<a id="endpointsEndpointIdTransformsTestPost"></a>
# **endpointsEndpointIdTransformsTestPost**
> endpointsEndpointIdTransformsTestPost(endpointId, endpointsEndpointIdTransformsTestPostRequest)

Test a transform rule

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.TransformsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    TransformsApi apiInstance = new TransformsApi(defaultClient);
    UUID endpointId = UUID.randomUUID(); // UUID | 
    EndpointsEndpointIdTransformsTestPostRequest endpointsEndpointIdTransformsTestPostRequest = new EndpointsEndpointIdTransformsTestPostRequest(); // EndpointsEndpointIdTransformsTestPostRequest | 
    try {
      apiInstance.endpointsEndpointIdTransformsTestPost(endpointId, endpointsEndpointIdTransformsTestPostRequest);
    } catch (ApiException e) {
      System.err.println("Exception when calling TransformsApi#endpointsEndpointIdTransformsTestPost");
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
| **endpointId** | **UUID**|  | |
| **endpointsEndpointIdTransformsTestPostRequest** | [**EndpointsEndpointIdTransformsTestPostRequest**](EndpointsEndpointIdTransformsTestPostRequest.md)|  | |

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
| **200** | Transformed output |  -  |

