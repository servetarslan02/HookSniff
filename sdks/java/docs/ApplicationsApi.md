# ApplicationsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**applicationsGet**](ApplicationsApi.md#applicationsGet) | **GET** /applications | List applications |
| [**applicationsIdDelete**](ApplicationsApi.md#applicationsIdDelete) | **DELETE** /applications/{id} | Delete application |
| [**applicationsIdGet**](ApplicationsApi.md#applicationsIdGet) | **GET** /applications/{id} | Get application |
| [**applicationsIdPut**](ApplicationsApi.md#applicationsIdPut) | **PUT** /applications/{id} | Update application |
| [**applicationsPost**](ApplicationsApi.md#applicationsPost) | **POST** /applications | Create application |


<a id="applicationsGet"></a>
# **applicationsGet**
> List&lt;Application&gt; applicationsGet()

List applications

Returns all applications for the authenticated user

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ApplicationsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    ApplicationsApi apiInstance = new ApplicationsApi(defaultClient);
    try {
      List<Application> result = apiInstance.applicationsGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling ApplicationsApi#applicationsGet");
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

[**List&lt;Application&gt;**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of applications |  -  |
| **401** |  |  -  |

<a id="applicationsIdDelete"></a>
# **applicationsIdDelete**
> applicationsIdDelete(id)

Delete application

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ApplicationsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    ApplicationsApi apiInstance = new ApplicationsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      apiInstance.applicationsIdDelete(id);
    } catch (ApiException e) {
      System.err.println("Exception when calling ApplicationsApi#applicationsIdDelete");
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
| **200** | Application deleted |  -  |
| **404** |  |  -  |

<a id="applicationsIdGet"></a>
# **applicationsIdGet**
> Application applicationsIdGet(id)

Get application

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ApplicationsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    ApplicationsApi apiInstance = new ApplicationsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      Application result = apiInstance.applicationsIdGet(id);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling ApplicationsApi#applicationsIdGet");
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

[**Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Application details |  -  |
| **404** |  |  -  |

<a id="applicationsIdPut"></a>
# **applicationsIdPut**
> Application applicationsIdPut(id, applicationsIdPutRequest)

Update application

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ApplicationsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    ApplicationsApi apiInstance = new ApplicationsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    ApplicationsIdPutRequest applicationsIdPutRequest = new ApplicationsIdPutRequest(); // ApplicationsIdPutRequest | 
    try {
      Application result = apiInstance.applicationsIdPut(id, applicationsIdPutRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling ApplicationsApi#applicationsIdPut");
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
| **applicationsIdPutRequest** | [**ApplicationsIdPutRequest**](ApplicationsIdPutRequest.md)|  | [optional] |

### Return type

[**Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Application updated |  -  |
| **404** |  |  -  |

<a id="applicationsPost"></a>
# **applicationsPost**
> Application applicationsPost(applicationsPostRequest)

Create application

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ApplicationsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    ApplicationsApi apiInstance = new ApplicationsApi(defaultClient);
    ApplicationsPostRequest applicationsPostRequest = new ApplicationsPostRequest(); // ApplicationsPostRequest | 
    try {
      Application result = apiInstance.applicationsPost(applicationsPostRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling ApplicationsApi#applicationsPost");
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
| **applicationsPostRequest** | [**ApplicationsPostRequest**](ApplicationsPostRequest.md)|  | |

### Return type

[**Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Application created |  -  |
| **400** | Validation error |  -  |
| **401** |  |  -  |

