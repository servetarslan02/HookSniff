# AdminApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**adminAlertsGet**](AdminApi.md#adminAlertsGet) | **GET** /admin/alerts | List all alert rules (admin) |
| [**adminAlertsIdDelete**](AdminApi.md#adminAlertsIdDelete) | **DELETE** /admin/alerts/{id} | Delete an alert rule (admin) |
| [**adminAlertsIdPut**](AdminApi.md#adminAlertsIdPut) | **PUT** /admin/alerts/{id} | Update an alert rule (admin) |
| [**adminAlertsPost**](AdminApi.md#adminAlertsPost) | **POST** /admin/alerts | Create a platform alert rule (admin) |
| [**adminAuditLogsGet**](AdminApi.md#adminAuditLogsGet) | **GET** /admin/audit-logs | List audit logs (admin) |
| [**adminChurnGet**](AdminApi.md#adminChurnGet) | **GET** /admin/churn | Get churn metrics (admin) |
| [**adminDeliveriesIdReplayPost**](AdminApi.md#adminDeliveriesIdReplayPost) | **POST** /admin/deliveries/{id}/replay | Replay a delivery (admin) |
| [**adminDeployInfoGet**](AdminApi.md#adminDeployInfoGet) | **GET** /admin/deploy-info | Get deploy info |
| [**adminFeatureFlagsGet**](AdminApi.md#adminFeatureFlagsGet) | **GET** /admin/feature-flags | List feature flags |
| [**adminFeatureFlagsIdDelete**](AdminApi.md#adminFeatureFlagsIdDelete) | **DELETE** /admin/feature-flags/{id} | Delete feature flag |
| [**adminFeatureFlagsIdPut**](AdminApi.md#adminFeatureFlagsIdPut) | **PUT** /admin/feature-flags/{id} | Update feature flag |
| [**adminFeatureFlagsPost**](AdminApi.md#adminFeatureFlagsPost) | **POST** /admin/feature-flags | Create feature flag |
| [**adminRevenueExportGet**](AdminApi.md#adminRevenueExportGet) | **GET** /admin/revenue/export | Export revenue data as CSV (admin) |
| [**adminRevenueGet**](AdminApi.md#adminRevenueGet) | **GET** /admin/revenue | Revenue analytics (admin) |
| [**adminSdkUpdatePost**](AdminApi.md#adminSdkUpdatePost) | **POST** /admin/sdk-update | Send SDK update notification to users |
| [**adminSettingsGet**](AdminApi.md#adminSettingsGet) | **GET** /admin/settings | Get platform settings (admin) |
| [**adminSettingsPut**](AdminApi.md#adminSettingsPut) | **PUT** /admin/settings | Update platform settings (admin) |
| [**adminStatsGet**](AdminApi.md#adminStatsGet) | **GET** /admin/stats | System-wide statistics (admin) |
| [**adminTestWebhookPost**](AdminApi.md#adminTestWebhookPost) | **POST** /admin/test-webhook | Send a test webhook to a URL (admin) |
| [**adminUsersExportGet**](AdminApi.md#adminUsersExportGet) | **GET** /admin/users/export | Export users as CSV (admin) |
| [**adminUsersGet**](AdminApi.md#adminUsersGet) | **GET** /admin/users | List all users (admin) |
| [**adminUsersIdAnalyticsGet**](AdminApi.md#adminUsersIdAnalyticsGet) | **GET** /admin/users/{id}/analytics | Get user analytics (admin) |
| [**adminUsersIdGet**](AdminApi.md#adminUsersIdGet) | **GET** /admin/users/{id} | Get user details (admin) |
| [**adminUsersIdPlanPut**](AdminApi.md#adminUsersIdPlanPut) | **PUT** /admin/users/{id}/plan | Change user plan (admin) |
| [**adminUsersIdStatusPut**](AdminApi.md#adminUsersIdStatusPut) | **PUT** /admin/users/{id}/status | Change user status (admin) |


<a id="adminAlertsGet"></a>
# **adminAlertsGet**
> List&lt;AdminAlertRule&gt; adminAlertsGet()

List all alert rules (admin)

Returns all alert rules for the authenticated admin&#39;s account

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    try {
      List<AdminAlertRule> result = apiInstance.adminAlertsGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminAlertsGet");
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

[**List&lt;AdminAlertRule&gt;**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of alert rules |  -  |

<a id="adminAlertsIdDelete"></a>
# **adminAlertsIdDelete**
> AdminAlertsIdDelete200Response adminAlertsIdDelete(id)

Delete an alert rule (admin)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      AdminAlertsIdDelete200Response result = apiInstance.adminAlertsIdDelete(id);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminAlertsIdDelete");
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

[**AdminAlertsIdDelete200Response**](AdminAlertsIdDelete200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Alert rule deleted |  -  |

<a id="adminAlertsIdPut"></a>
# **adminAlertsIdPut**
> AdminAlertRule adminAlertsIdPut(id, adminUpdateAlertRequest)

Update an alert rule (admin)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    AdminUpdateAlertRequest adminUpdateAlertRequest = new AdminUpdateAlertRequest(); // AdminUpdateAlertRequest | 
    try {
      AdminAlertRule result = apiInstance.adminAlertsIdPut(id, adminUpdateAlertRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminAlertsIdPut");
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
| **adminUpdateAlertRequest** | [**AdminUpdateAlertRequest**](AdminUpdateAlertRequest.md)|  | [optional] |

### Return type

[**AdminAlertRule**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Alert rule updated |  -  |

<a id="adminAlertsPost"></a>
# **adminAlertsPost**
> AdminAlertRule adminAlertsPost(adminCreateAlertRequest)

Create a platform alert rule (admin)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    AdminCreateAlertRequest adminCreateAlertRequest = new AdminCreateAlertRequest(); // AdminCreateAlertRequest | 
    try {
      AdminAlertRule result = apiInstance.adminAlertsPost(adminCreateAlertRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminAlertsPost");
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
| **adminCreateAlertRequest** | [**AdminCreateAlertRequest**](AdminCreateAlertRequest.md)|  | |

### Return type

[**AdminAlertRule**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Alert rule created |  -  |

<a id="adminAuditLogsGet"></a>
# **adminAuditLogsGet**
> AdminAuditLogResponse adminAuditLogsGet(page, perPage, action, adminId)

List audit logs (admin)

Returns all audit log entries across all users

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    Integer page = 1; // Integer | 
    Integer perPage = 50; // Integer | 
    String action = "action_example"; // String | 
    UUID adminId = UUID.randomUUID(); // UUID | 
    try {
      AdminAuditLogResponse result = apiInstance.adminAuditLogsGet(page, perPage, action, adminId);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminAuditLogsGet");
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
| **page** | **Integer**|  | [optional] [default to 1] |
| **perPage** | **Integer**|  | [optional] [default to 50] |
| **action** | **String**|  | [optional] |
| **adminId** | **UUID**|  | [optional] |

### Return type

[**AdminAuditLogResponse**](AdminAuditLogResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Paginated audit log entries |  -  |

<a id="adminChurnGet"></a>
# **adminChurnGet**
> ChurnResponse adminChurnGet()

Get churn metrics (admin)

Lists users who became inactive in the last 30 days

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    try {
      ChurnResponse result = apiInstance.adminChurnGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminChurnGet");
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

[**ChurnResponse**](ChurnResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Churn report |  -  |

<a id="adminDeliveriesIdReplayPost"></a>
# **adminDeliveriesIdReplayPost**
> ReplayDeliveryResponse adminDeliveriesIdReplayPost(id)

Replay a delivery (admin)

Creates a new delivery with the same payload as the original

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | Original delivery ID to replay
    try {
      ReplayDeliveryResponse result = apiInstance.adminDeliveriesIdReplayPost(id);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminDeliveriesIdReplayPost");
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
| **id** | **UUID**| Original delivery ID to replay | |

### Return type

[**ReplayDeliveryResponse**](ReplayDeliveryResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Delivery replayed |  -  |

<a id="adminDeployInfoGet"></a>
# **adminDeployInfoGet**
> DeployInfo adminDeployInfoGet()

Get deploy info

Admin-only. Returns current deployment version and build info.

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    try {
      DeployInfo result = apiInstance.adminDeployInfoGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminDeployInfoGet");
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

[**DeployInfo**](DeployInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Deploy info |  -  |
| **401** |  |  -  |
| **403** |  |  -  |

<a id="adminFeatureFlagsGet"></a>
# **adminFeatureFlagsGet**
> AdminFeatureFlagsGet200Response adminFeatureFlagsGet()

List feature flags

Admin-only. Returns all feature flags.

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    try {
      AdminFeatureFlagsGet200Response result = apiInstance.adminFeatureFlagsGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminFeatureFlagsGet");
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

[**AdminFeatureFlagsGet200Response**](AdminFeatureFlagsGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Feature flags |  -  |
| **401** |  |  -  |
| **403** |  |  -  |

<a id="adminFeatureFlagsIdDelete"></a>
# **adminFeatureFlagsIdDelete**
> adminFeatureFlagsIdDelete(id)

Delete feature flag

Admin-only. Deletes a feature flag.

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      apiInstance.adminFeatureFlagsIdDelete(id);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminFeatureFlagsIdDelete");
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
| **200** | Feature flag deleted |  -  |
| **404** |  |  -  |
| **403** |  |  -  |

<a id="adminFeatureFlagsIdPut"></a>
# **adminFeatureFlagsIdPut**
> FeatureFlag adminFeatureFlagsIdPut(id, adminFeatureFlagsIdPutRequest)

Update feature flag

Admin-only. Updates a feature flag.

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    AdminFeatureFlagsIdPutRequest adminFeatureFlagsIdPutRequest = new AdminFeatureFlagsIdPutRequest(); // AdminFeatureFlagsIdPutRequest | 
    try {
      FeatureFlag result = apiInstance.adminFeatureFlagsIdPut(id, adminFeatureFlagsIdPutRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminFeatureFlagsIdPut");
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
| **adminFeatureFlagsIdPutRequest** | [**AdminFeatureFlagsIdPutRequest**](AdminFeatureFlagsIdPutRequest.md)|  | [optional] |

### Return type

[**FeatureFlag**](FeatureFlag.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Feature flag updated |  -  |
| **404** |  |  -  |
| **403** |  |  -  |

<a id="adminFeatureFlagsPost"></a>
# **adminFeatureFlagsPost**
> FeatureFlag adminFeatureFlagsPost(adminFeatureFlagsPostRequest)

Create feature flag

Admin-only. Creates a new feature flag.

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    AdminFeatureFlagsPostRequest adminFeatureFlagsPostRequest = new AdminFeatureFlagsPostRequest(); // AdminFeatureFlagsPostRequest | 
    try {
      FeatureFlag result = apiInstance.adminFeatureFlagsPost(adminFeatureFlagsPostRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminFeatureFlagsPost");
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
| **adminFeatureFlagsPostRequest** | [**AdminFeatureFlagsPostRequest**](AdminFeatureFlagsPostRequest.md)|  | |

### Return type

[**FeatureFlag**](FeatureFlag.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Feature flag created |  -  |
| **400** | Validation error |  -  |
| **403** |  |  -  |

<a id="adminRevenueExportGet"></a>
# **adminRevenueExportGet**
> String adminRevenueExportGet(format, months)

Export revenue data as CSV (admin)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    String format = "csv"; // String | 
    Integer months = 12; // Integer | Number of months to include
    try {
      String result = apiInstance.adminRevenueExportGet(format, months);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminRevenueExportGet");
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
| **format** | **String**|  | [optional] [default to csv] [enum: csv] |
| **months** | **Integer**| Number of months to include | [optional] [default to 12] |

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/csv

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Revenue CSV export |  -  |

<a id="adminRevenueGet"></a>
# **adminRevenueGet**
> RevenueResponse adminRevenueGet()

Revenue analytics (admin)

Returns monthly revenue, revenue by plan, MRR, churn rate, and MRR trend

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    try {
      RevenueResponse result = apiInstance.adminRevenueGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminRevenueGet");
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

[**RevenueResponse**](RevenueResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Revenue data |  -  |

<a id="adminSdkUpdatePost"></a>
# **adminSdkUpdatePost**
> adminSdkUpdatePost(adminSdkUpdatePostRequest)

Send SDK update notification to users

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    AdminSdkUpdatePostRequest adminSdkUpdatePostRequest = new AdminSdkUpdatePostRequest(); // AdminSdkUpdatePostRequest | 
    try {
      apiInstance.adminSdkUpdatePost(adminSdkUpdatePostRequest);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminSdkUpdatePost");
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
| **adminSdkUpdatePostRequest** | [**AdminSdkUpdatePostRequest**](AdminSdkUpdatePostRequest.md)|  | [optional] |

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
| **200** | Notification sent |  -  |

<a id="adminSettingsGet"></a>
# **adminSettingsGet**
> PlatformSettings adminSettingsGet()

Get platform settings (admin)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    try {
      PlatformSettings result = apiInstance.adminSettingsGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminSettingsGet");
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

[**PlatformSettings**](PlatformSettings.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Platform settings |  -  |

<a id="adminSettingsPut"></a>
# **adminSettingsPut**
> AdminSettingsPut200Response adminSettingsPut(platformSettings)

Update platform settings (admin)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    PlatformSettings platformSettings = new PlatformSettings(); // PlatformSettings | 
    try {
      AdminSettingsPut200Response result = apiInstance.adminSettingsPut(platformSettings);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminSettingsPut");
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
| **platformSettings** | [**PlatformSettings**](PlatformSettings.md)|  | |

### Return type

[**AdminSettingsPut200Response**](AdminSettingsPut200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Settings updated |  -  |

<a id="adminStatsGet"></a>
# **adminStatsGet**
> SystemStats adminStatsGet()

System-wide statistics (admin)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    try {
      SystemStats result = apiInstance.adminStatsGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminStatsGet");
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

[**SystemStats**](SystemStats.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | System stats |  -  |

<a id="adminTestWebhookPost"></a>
# **adminTestWebhookPost**
> AdminTestWebhookResponse adminTestWebhookPost(adminTestWebhookRequest)

Send a test webhook to a URL (admin)

Sends an HTTP POST to the specified URL with SSRF protection

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    AdminTestWebhookRequest adminTestWebhookRequest = new AdminTestWebhookRequest(); // AdminTestWebhookRequest | 
    try {
      AdminTestWebhookResponse result = apiInstance.adminTestWebhookPost(adminTestWebhookRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminTestWebhookPost");
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
| **adminTestWebhookRequest** | [**AdminTestWebhookRequest**](AdminTestWebhookRequest.md)|  | |

### Return type

[**AdminTestWebhookResponse**](AdminTestWebhookResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Test webhook result |  -  |

<a id="adminUsersExportGet"></a>
# **adminUsersExportGet**
> String adminUsersExportGet(format, plan, status)

Export users as CSV (admin)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    String format = "csv"; // String | 
    String plan = "free"; // String | Filter by plan
    String status = "active"; // String | Filter by status
    try {
      String result = apiInstance.adminUsersExportGet(format, plan, status);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminUsersExportGet");
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
| **format** | **String**|  | [optional] [default to csv] [enum: csv] |
| **plan** | **String**| Filter by plan | [optional] [enum: free, pro, business] |
| **status** | **String**| Filter by status | [optional] [enum: active, banned] |

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/csv

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Users CSV export |  -  |

<a id="adminUsersGet"></a>
# **adminUsersGet**
> PaginatedUsers adminUsersGet(page, perPage, search, plan, status, createdAfter, createdBefore)

List all users (admin)

Returns paginated list of users with optional filters

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    Integer page = 1; // Integer | 
    Integer perPage = 20; // Integer | 
    String search = "search_example"; // String | Search by email or name (ILIKE)
    String plan = "free"; // String | Filter by plan
    String status = "active"; // String | Filter by status
    LocalDate createdAfter = LocalDate.now(); // LocalDate | Filter users created after this date (ISO 8601)
    LocalDate createdBefore = LocalDate.now(); // LocalDate | Filter users created before this date (ISO 8601)
    try {
      PaginatedUsers result = apiInstance.adminUsersGet(page, perPage, search, plan, status, createdAfter, createdBefore);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminUsersGet");
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
| **page** | **Integer**|  | [optional] [default to 1] |
| **perPage** | **Integer**|  | [optional] [default to 20] |
| **search** | **String**| Search by email or name (ILIKE) | [optional] |
| **plan** | **String**| Filter by plan | [optional] [enum: free, pro, business] |
| **status** | **String**| Filter by status | [optional] [enum: active, banned] |
| **createdAfter** | **LocalDate**| Filter users created after this date (ISO 8601) | [optional] |
| **createdBefore** | **LocalDate**| Filter users created before this date (ISO 8601) | [optional] |

### Return type

[**PaginatedUsers**](PaginatedUsers.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Paginated user list |  -  |

<a id="adminUsersIdAnalyticsGet"></a>
# **adminUsersIdAnalyticsGet**
> UserAnalytics adminUsersIdAnalyticsGet(id, days)

Get user analytics (admin)

Returns delivery analytics for a specific user over a time period

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    Integer days = 30; // Integer | Number of days to analyze
    try {
      UserAnalytics result = apiInstance.adminUsersIdAnalyticsGet(id, days);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminUsersIdAnalyticsGet");
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
| **days** | **Integer**| Number of days to analyze | [optional] [default to 30] |

### Return type

[**UserAnalytics**](UserAnalytics.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | User analytics data |  -  |

<a id="adminUsersIdGet"></a>
# **adminUsersIdGet**
> AdminUsersIdGet200Response adminUsersIdGet(id)

Get user details (admin)

Returns user details with endpoints, recent deliveries, and usage stats

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      AdminUsersIdGet200Response result = apiInstance.adminUsersIdGet(id);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminUsersIdGet");
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

[**AdminUsersIdGet200Response**](AdminUsersIdGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | User details |  -  |

<a id="adminUsersIdPlanPut"></a>
# **adminUsersIdPlanPut**
> adminUsersIdPlanPut(id, adminUsersIdPlanPutRequest)

Change user plan (admin)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    AdminUsersIdPlanPutRequest adminUsersIdPlanPutRequest = new AdminUsersIdPlanPutRequest(); // AdminUsersIdPlanPutRequest | 
    try {
      apiInstance.adminUsersIdPlanPut(id, adminUsersIdPlanPutRequest);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminUsersIdPlanPut");
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
| **adminUsersIdPlanPutRequest** | [**AdminUsersIdPlanPutRequest**](AdminUsersIdPlanPutRequest.md)|  | |

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
| **200** | Plan changed |  -  |

<a id="adminUsersIdStatusPut"></a>
# **adminUsersIdStatusPut**
> adminUsersIdStatusPut(id, adminUsersIdStatusPutRequest)

Change user status (admin)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.AdminApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    AdminApi apiInstance = new AdminApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    AdminUsersIdStatusPutRequest adminUsersIdStatusPutRequest = new AdminUsersIdStatusPutRequest(); // AdminUsersIdStatusPutRequest | 
    try {
      apiInstance.adminUsersIdStatusPut(id, adminUsersIdStatusPutRequest);
    } catch (ApiException e) {
      System.err.println("Exception when calling AdminApi#adminUsersIdStatusPut");
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
| **adminUsersIdStatusPutRequest** | [**AdminUsersIdStatusPutRequest**](AdminUsersIdStatusPutRequest.md)|  | |

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
| **200** | Status changed |  -  |

