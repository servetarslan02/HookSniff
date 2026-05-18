# CustomerPortalApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**portalApiKeysGet**](CustomerPortalApi.md#portalApiKeysGet) | **GET** /portal/api-keys | List API keys (portal) |
| [**portalApiKeysKeyIdDelete**](CustomerPortalApi.md#portalApiKeysKeyIdDelete) | **DELETE** /portal/api-keys/{key_id} | Revoke API key (portal) |
| [**portalApiKeysPost**](CustomerPortalApi.md#portalApiKeysPost) | **POST** /portal/api-keys | Create API key (portal) |
| [**portalConfigGet**](CustomerPortalApi.md#portalConfigGet) | **GET** /portal/config | Get portal configuration |
| [**portalConfigPost**](CustomerPortalApi.md#portalConfigPost) | **POST** /portal/config | Update portal configuration |
| [**portalEmbedCodeGet**](CustomerPortalApi.md#portalEmbedCodeGet) | **GET** /portal/embed-code | Get portal embed code |
| [**portalMeGet**](CustomerPortalApi.md#portalMeGet) | **GET** /portal/me | Get portal profile |
| [**portalMePut**](CustomerPortalApi.md#portalMePut) | **PUT** /portal/me | Update portal profile |
| [**portalNotificationsGet**](CustomerPortalApi.md#portalNotificationsGet) | **GET** /portal/notifications | Get notification preferences (portal) |
| [**portalNotificationsPut**](CustomerPortalApi.md#portalNotificationsPut) | **PUT** /portal/notifications | Update notification preferences (portal) |
| [**portalPlanGet**](CustomerPortalApi.md#portalPlanGet) | **GET** /portal/plan | Get plan info (portal) |
| [**portalUsageGet**](CustomerPortalApi.md#portalUsageGet) | **GET** /portal/usage | Get usage (portal) |


<a id="portalApiKeysGet"></a>
# **portalApiKeysGet**
> List&lt;ApiKeyInfo&gt; portalApiKeysGet()

List API keys (portal)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.CustomerPortalApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    CustomerPortalApi apiInstance = new CustomerPortalApi(defaultClient);
    try {
      List<ApiKeyInfo> result = apiInstance.portalApiKeysGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling CustomerPortalApi#portalApiKeysGet");
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

[**List&lt;ApiKeyInfo&gt;**](ApiKeyInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | API key list |  -  |

<a id="portalApiKeysKeyIdDelete"></a>
# **portalApiKeysKeyIdDelete**
> portalApiKeysKeyIdDelete(keyId)

Revoke API key (portal)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.CustomerPortalApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    CustomerPortalApi apiInstance = new CustomerPortalApi(defaultClient);
    UUID keyId = UUID.randomUUID(); // UUID | 
    try {
      apiInstance.portalApiKeysKeyIdDelete(keyId);
    } catch (ApiException e) {
      System.err.println("Exception when calling CustomerPortalApi#portalApiKeysKeyIdDelete");
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
| **keyId** | **UUID**|  | |

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
| **200** | Key revoked |  -  |

<a id="portalApiKeysPost"></a>
# **portalApiKeysPost**
> CreateApiKeyResponse portalApiKeysPost()

Create API key (portal)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.CustomerPortalApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    CustomerPortalApi apiInstance = new CustomerPortalApi(defaultClient);
    try {
      CreateApiKeyResponse result = apiInstance.portalApiKeysPost();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling CustomerPortalApi#portalApiKeysPost");
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

[**CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | API key created |  -  |

<a id="portalConfigGet"></a>
# **portalConfigGet**
> portalConfigGet()

Get portal configuration

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.CustomerPortalApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    CustomerPortalApi apiInstance = new CustomerPortalApi(defaultClient);
    try {
      apiInstance.portalConfigGet();
    } catch (ApiException e) {
      System.err.println("Exception when calling CustomerPortalApi#portalConfigGet");
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
| **200** | Portal config |  -  |

<a id="portalConfigPost"></a>
# **portalConfigPost**
> portalConfigPost()

Update portal configuration

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.CustomerPortalApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    CustomerPortalApi apiInstance = new CustomerPortalApi(defaultClient);
    try {
      apiInstance.portalConfigPost();
    } catch (ApiException e) {
      System.err.println("Exception when calling CustomerPortalApi#portalConfigPost");
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
| **200** | Portal config saved |  -  |

<a id="portalEmbedCodeGet"></a>
# **portalEmbedCodeGet**
> portalEmbedCodeGet()

Get portal embed code

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.CustomerPortalApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    CustomerPortalApi apiInstance = new CustomerPortalApi(defaultClient);
    try {
      apiInstance.portalEmbedCodeGet();
    } catch (ApiException e) {
      System.err.println("Exception when calling CustomerPortalApi#portalEmbedCodeGet");
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
| **200** | Embed code snippet |  -  |

<a id="portalMeGet"></a>
# **portalMeGet**
> PortalProfile portalMeGet()

Get portal profile

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.CustomerPortalApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    CustomerPortalApi apiInstance = new CustomerPortalApi(defaultClient);
    try {
      PortalProfile result = apiInstance.portalMeGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling CustomerPortalApi#portalMeGet");
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

[**PortalProfile**](PortalProfile.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Profile |  -  |

<a id="portalMePut"></a>
# **portalMePut**
> portalMePut(updateProfileRequest)

Update portal profile

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.CustomerPortalApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    CustomerPortalApi apiInstance = new CustomerPortalApi(defaultClient);
    UpdateProfileRequest updateProfileRequest = new UpdateProfileRequest(); // UpdateProfileRequest | 
    try {
      apiInstance.portalMePut(updateProfileRequest);
    } catch (ApiException e) {
      System.err.println("Exception when calling CustomerPortalApi#portalMePut");
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
| **updateProfileRequest** | [**UpdateProfileRequest**](UpdateProfileRequest.md)|  | |

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
| **200** | Profile updated |  -  |

<a id="portalNotificationsGet"></a>
# **portalNotificationsGet**
> NotificationPreferences portalNotificationsGet()

Get notification preferences (portal)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.CustomerPortalApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    CustomerPortalApi apiInstance = new CustomerPortalApi(defaultClient);
    try {
      NotificationPreferences result = apiInstance.portalNotificationsGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling CustomerPortalApi#portalNotificationsGet");
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

[**NotificationPreferences**](NotificationPreferences.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Notification preferences |  -  |

<a id="portalNotificationsPut"></a>
# **portalNotificationsPut**
> PortalNotificationsPut200Response portalNotificationsPut(updateNotificationPreferences)

Update notification preferences (portal)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.CustomerPortalApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    CustomerPortalApi apiInstance = new CustomerPortalApi(defaultClient);
    UpdateNotificationPreferences updateNotificationPreferences = new UpdateNotificationPreferences(); // UpdateNotificationPreferences | 
    try {
      PortalNotificationsPut200Response result = apiInstance.portalNotificationsPut(updateNotificationPreferences);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling CustomerPortalApi#portalNotificationsPut");
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
| **updateNotificationPreferences** | [**UpdateNotificationPreferences**](UpdateNotificationPreferences.md)|  | |

### Return type

[**PortalNotificationsPut200Response**](PortalNotificationsPut200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Preferences updated |  -  |

<a id="portalPlanGet"></a>
# **portalPlanGet**
> SubscriptionResponse portalPlanGet()

Get plan info (portal)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.CustomerPortalApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    CustomerPortalApi apiInstance = new CustomerPortalApi(defaultClient);
    try {
      SubscriptionResponse result = apiInstance.portalPlanGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling CustomerPortalApi#portalPlanGet");
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

[**SubscriptionResponse**](SubscriptionResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Plan details |  -  |

<a id="portalUsageGet"></a>
# **portalUsageGet**
> UsageResponse portalUsageGet()

Get usage (portal)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.CustomerPortalApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    CustomerPortalApi apiInstance = new CustomerPortalApi(defaultClient);
    try {
      UsageResponse result = apiInstance.portalUsageGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling CustomerPortalApi#portalUsageGet");
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

[**UsageResponse**](UsageResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Usage data |  -  |

