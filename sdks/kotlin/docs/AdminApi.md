# AdminApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
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
> kotlin.collections.List&lt;AdminAlertRule&gt; adminAlertsGet()

List all alert rules (admin)

Returns all alert rules for the authenticated admin&#39;s account

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
try {
    val result : kotlin.collections.List<AdminAlertRule> = apiInstance.adminAlertsGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminAlertsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminAlertsGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**kotlin.collections.List&lt;AdminAlertRule&gt;**](AdminAlertRule.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminAlertsIdDelete"></a>
# **adminAlertsIdDelete**
> AdminAlertsIdDelete200Response adminAlertsIdDelete(id)

Delete an alert rule (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : AdminAlertsIdDelete200Response = apiInstance.adminAlertsIdDelete(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminAlertsIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminAlertsIdDelete")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**AdminAlertsIdDelete200Response**](AdminAlertsIdDelete200Response.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminAlertsIdPut"></a>
# **adminAlertsIdPut**
> AdminAlertRule adminAlertsIdPut(id, adminUpdateAlertRequest)

Update an alert rule (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val adminUpdateAlertRequest : AdminUpdateAlertRequest =  // AdminUpdateAlertRequest | 
try {
    val result : AdminAlertRule = apiInstance.adminAlertsIdPut(id, adminUpdateAlertRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminAlertsIdPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminAlertsIdPut")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **adminUpdateAlertRequest** | [**AdminUpdateAlertRequest**](AdminUpdateAlertRequest.md)|  | [optional] |

### Return type

[**AdminAlertRule**](AdminAlertRule.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="adminAlertsPost"></a>
# **adminAlertsPost**
> AdminAlertRule adminAlertsPost(adminCreateAlertRequest)

Create a platform alert rule (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val adminCreateAlertRequest : AdminCreateAlertRequest =  // AdminCreateAlertRequest | 
try {
    val result : AdminAlertRule = apiInstance.adminAlertsPost(adminCreateAlertRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminAlertsPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminAlertsPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **adminCreateAlertRequest** | [**AdminCreateAlertRequest**](AdminCreateAlertRequest.md)|  | |

### Return type

[**AdminAlertRule**](AdminAlertRule.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="adminAuditLogsGet"></a>
# **adminAuditLogsGet**
> AdminAuditLogResponse adminAuditLogsGet(page, perPage, action, adminId)

List audit logs (admin)

Returns all audit log entries across all users

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val page : kotlin.Int = 56 // kotlin.Int | 
val perPage : kotlin.Int = 56 // kotlin.Int | 
val action : kotlin.String = action_example // kotlin.String | 
val adminId : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : AdminAuditLogResponse = apiInstance.adminAuditLogsGet(page, perPage, action, adminId)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminAuditLogsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminAuditLogsGet")
    e.printStackTrace()
}
```

### Parameters
| **page** | **kotlin.Int**|  | [optional] [default to 1] |
| **perPage** | **kotlin.Int**|  | [optional] [default to 50] |
| **action** | **kotlin.String**|  | [optional] |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **adminId** | **java.util.UUID**|  | [optional] |

### Return type

[**AdminAuditLogResponse**](AdminAuditLogResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminChurnGet"></a>
# **adminChurnGet**
> ChurnResponse adminChurnGet()

Get churn metrics (admin)

Lists users who became inactive in the last 30 days

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
try {
    val result : ChurnResponse = apiInstance.adminChurnGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminChurnGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminChurnGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ChurnResponse**](ChurnResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminDeliveriesIdReplayPost"></a>
# **adminDeliveriesIdReplayPost**
> ReplayDeliveryResponse adminDeliveriesIdReplayPost(id)

Replay a delivery (admin)

Creates a new delivery with the same payload as the original

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | Original delivery ID to replay
try {
    val result : ReplayDeliveryResponse = apiInstance.adminDeliveriesIdReplayPost(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminDeliveriesIdReplayPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminDeliveriesIdReplayPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**| Original delivery ID to replay | |

### Return type

[**ReplayDeliveryResponse**](ReplayDeliveryResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminDeployInfoGet"></a>
# **adminDeployInfoGet**
> DeployInfo adminDeployInfoGet()

Get deploy info

Admin-only. Returns current deployment version and build info.

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
try {
    val result : DeployInfo = apiInstance.adminDeployInfoGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminDeployInfoGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminDeployInfoGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**DeployInfo**](DeployInfo.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminFeatureFlagsGet"></a>
# **adminFeatureFlagsGet**
> AdminFeatureFlagsGet200Response adminFeatureFlagsGet()

List feature flags

Admin-only. Returns all feature flags.

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
try {
    val result : AdminFeatureFlagsGet200Response = apiInstance.adminFeatureFlagsGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminFeatureFlagsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminFeatureFlagsGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**AdminFeatureFlagsGet200Response**](AdminFeatureFlagsGet200Response.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminFeatureFlagsIdDelete"></a>
# **adminFeatureFlagsIdDelete**
> adminFeatureFlagsIdDelete(id)

Delete feature flag

Admin-only. Deletes a feature flag.

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.adminFeatureFlagsIdDelete(id)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminFeatureFlagsIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminFeatureFlagsIdDelete")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="adminFeatureFlagsIdPut"></a>
# **adminFeatureFlagsIdPut**
> FeatureFlag adminFeatureFlagsIdPut(id, adminFeatureFlagsIdPutRequest)

Update feature flag

Admin-only. Updates a feature flag.

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val adminFeatureFlagsIdPutRequest : AdminFeatureFlagsIdPutRequest =  // AdminFeatureFlagsIdPutRequest | 
try {
    val result : FeatureFlag = apiInstance.adminFeatureFlagsIdPut(id, adminFeatureFlagsIdPutRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminFeatureFlagsIdPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminFeatureFlagsIdPut")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **adminFeatureFlagsIdPutRequest** | [**AdminFeatureFlagsIdPutRequest**](AdminFeatureFlagsIdPutRequest.md)|  | [optional] |

### Return type

[**FeatureFlag**](FeatureFlag.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="adminFeatureFlagsPost"></a>
# **adminFeatureFlagsPost**
> FeatureFlag adminFeatureFlagsPost(adminFeatureFlagsPostRequest)

Create feature flag

Admin-only. Creates a new feature flag.

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val adminFeatureFlagsPostRequest : AdminFeatureFlagsPostRequest =  // AdminFeatureFlagsPostRequest | 
try {
    val result : FeatureFlag = apiInstance.adminFeatureFlagsPost(adminFeatureFlagsPostRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminFeatureFlagsPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminFeatureFlagsPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **adminFeatureFlagsPostRequest** | [**AdminFeatureFlagsPostRequest**](AdminFeatureFlagsPostRequest.md)|  | |

### Return type

[**FeatureFlag**](FeatureFlag.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="adminRevenueExportGet"></a>
# **adminRevenueExportGet**
> kotlin.String adminRevenueExportGet(format, months)

Export revenue data as CSV (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val format : kotlin.String = format_example // kotlin.String | 
val months : kotlin.Int = 56 // kotlin.Int | Number of months to include
try {
    val result : kotlin.String = apiInstance.adminRevenueExportGet(format, months)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminRevenueExportGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminRevenueExportGet")
    e.printStackTrace()
}
```

### Parameters
| **format** | **kotlin.String**|  | [optional] [default to Format.csv] [enum: csv] |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **months** | **kotlin.Int**| Number of months to include | [optional] [default to 12] |

### Return type

**kotlin.String**

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="adminRevenueGet"></a>
# **adminRevenueGet**
> RevenueResponse adminRevenueGet()

Revenue analytics (admin)

Returns monthly revenue, revenue by plan, MRR, churn rate, and MRR trend

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
try {
    val result : RevenueResponse = apiInstance.adminRevenueGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminRevenueGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminRevenueGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**RevenueResponse**](RevenueResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminSdkUpdatePost"></a>
# **adminSdkUpdatePost**
> adminSdkUpdatePost(adminSdkUpdatePostRequest)

Send SDK update notification to users

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val adminSdkUpdatePostRequest : AdminSdkUpdatePostRequest =  // AdminSdkUpdatePostRequest | 
try {
    apiInstance.adminSdkUpdatePost(adminSdkUpdatePostRequest)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminSdkUpdatePost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminSdkUpdatePost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **adminSdkUpdatePostRequest** | [**AdminSdkUpdatePostRequest**](AdminSdkUpdatePostRequest.md)|  | [optional] |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="adminSettingsGet"></a>
# **adminSettingsGet**
> PlatformSettings adminSettingsGet()

Get platform settings (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
try {
    val result : PlatformSettings = apiInstance.adminSettingsGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminSettingsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminSettingsGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**PlatformSettings**](PlatformSettings.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminSettingsPut"></a>
# **adminSettingsPut**
> AdminSettingsPut200Response adminSettingsPut(platformSettings)

Update platform settings (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val platformSettings : PlatformSettings =  // PlatformSettings | 
try {
    val result : AdminSettingsPut200Response = apiInstance.adminSettingsPut(platformSettings)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminSettingsPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminSettingsPut")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **platformSettings** | [**PlatformSettings**](PlatformSettings.md)|  | |

### Return type

[**AdminSettingsPut200Response**](AdminSettingsPut200Response.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="adminStatsGet"></a>
# **adminStatsGet**
> SystemStats adminStatsGet()

System-wide statistics (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
try {
    val result : SystemStats = apiInstance.adminStatsGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminStatsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminStatsGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**SystemStats**](SystemStats.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminTestWebhookPost"></a>
# **adminTestWebhookPost**
> AdminTestWebhookResponse adminTestWebhookPost(adminTestWebhookRequest)

Send a test webhook to a URL (admin)

Sends an HTTP POST to the specified URL with SSRF protection

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val adminTestWebhookRequest : AdminTestWebhookRequest =  // AdminTestWebhookRequest | 
try {
    val result : AdminTestWebhookResponse = apiInstance.adminTestWebhookPost(adminTestWebhookRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminTestWebhookPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminTestWebhookPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **adminTestWebhookRequest** | [**AdminTestWebhookRequest**](AdminTestWebhookRequest.md)|  | |

### Return type

[**AdminTestWebhookResponse**](AdminTestWebhookResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="adminUsersExportGet"></a>
# **adminUsersExportGet**
> kotlin.String adminUsersExportGet(format, plan, status)

Export users as CSV (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val format : kotlin.String = format_example // kotlin.String | 
val plan : kotlin.String = plan_example // kotlin.String | Filter by plan
val status : kotlin.String = status_example // kotlin.String | Filter by status
try {
    val result : kotlin.String = apiInstance.adminUsersExportGet(format, plan, status)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminUsersExportGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminUsersExportGet")
    e.printStackTrace()
}
```

### Parameters
| **format** | **kotlin.String**|  | [optional] [default to Format.csv] [enum: csv] |
| **plan** | **kotlin.String**| Filter by plan | [optional] [enum: free, pro, business] |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **status** | **kotlin.String**| Filter by status | [optional] [enum: active, banned] |

### Return type

**kotlin.String**

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="adminUsersGet"></a>
# **adminUsersGet**
> PaginatedUsers adminUsersGet(page, perPage, search, plan, status, createdAfter, createdBefore)

List all users (admin)

Returns paginated list of users with optional filters

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val page : kotlin.Int = 56 // kotlin.Int | 
val perPage : kotlin.Int = 56 // kotlin.Int | 
val search : kotlin.String = search_example // kotlin.String | Search by email or name (ILIKE)
val plan : kotlin.String = plan_example // kotlin.String | Filter by plan
val status : kotlin.String = status_example // kotlin.String | Filter by status
val createdAfter : java.time.LocalDate = 2013-10-20 // java.time.LocalDate | Filter users created after this date (ISO 8601)
val createdBefore : java.time.LocalDate = 2013-10-20 // java.time.LocalDate | Filter users created before this date (ISO 8601)
try {
    val result : PaginatedUsers = apiInstance.adminUsersGet(page, perPage, search, plan, status, createdAfter, createdBefore)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminUsersGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminUsersGet")
    e.printStackTrace()
}
```

### Parameters
| **page** | **kotlin.Int**|  | [optional] [default to 1] |
| **perPage** | **kotlin.Int**|  | [optional] [default to 20] |
| **search** | **kotlin.String**| Search by email or name (ILIKE) | [optional] |
| **plan** | **kotlin.String**| Filter by plan | [optional] [enum: free, pro, business] |
| **status** | **kotlin.String**| Filter by status | [optional] [enum: active, banned] |
| **createdAfter** | **java.time.LocalDate**| Filter users created after this date (ISO 8601) | [optional] |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **createdBefore** | **java.time.LocalDate**| Filter users created before this date (ISO 8601) | [optional] |

### Return type

[**PaginatedUsers**](PaginatedUsers.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminUsersIdAnalyticsGet"></a>
# **adminUsersIdAnalyticsGet**
> UserAnalytics adminUsersIdAnalyticsGet(id, days)

Get user analytics (admin)

Returns delivery analytics for a specific user over a time period

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val days : kotlin.Int = 56 // kotlin.Int | Number of days to analyze
try {
    val result : UserAnalytics = apiInstance.adminUsersIdAnalyticsGet(id, days)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminUsersIdAnalyticsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminUsersIdAnalyticsGet")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **days** | **kotlin.Int**| Number of days to analyze | [optional] [default to 30] |

### Return type

[**UserAnalytics**](UserAnalytics.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminUsersIdGet"></a>
# **adminUsersIdGet**
> AdminUsersIdGet200Response adminUsersIdGet(id)

Get user details (admin)

Returns user details with endpoints, recent deliveries, and usage stats

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : AdminUsersIdGet200Response = apiInstance.adminUsersIdGet(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminUsersIdGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminUsersIdGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**AdminUsersIdGet200Response**](AdminUsersIdGet200Response.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="adminUsersIdPlanPut"></a>
# **adminUsersIdPlanPut**
> adminUsersIdPlanPut(id, adminUsersIdPlanPutRequest)

Change user plan (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val adminUsersIdPlanPutRequest : AdminUsersIdPlanPutRequest =  // AdminUsersIdPlanPutRequest | 
try {
    apiInstance.adminUsersIdPlanPut(id, adminUsersIdPlanPutRequest)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminUsersIdPlanPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminUsersIdPlanPut")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **adminUsersIdPlanPutRequest** | [**AdminUsersIdPlanPutRequest**](AdminUsersIdPlanPutRequest.md)|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="adminUsersIdStatusPut"></a>
# **adminUsersIdStatusPut**
> adminUsersIdStatusPut(id, adminUsersIdStatusPutRequest)

Change user status (admin)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AdminApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val adminUsersIdStatusPutRequest : AdminUsersIdStatusPutRequest =  // AdminUsersIdStatusPutRequest | 
try {
    apiInstance.adminUsersIdStatusPut(id, adminUsersIdStatusPutRequest)
} catch (e: ClientException) {
    println("4xx response calling AdminApi#adminUsersIdStatusPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AdminApi#adminUsersIdStatusPut")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **adminUsersIdStatusPutRequest** | [**AdminUsersIdStatusPutRequest**](AdminUsersIdStatusPutRequest.md)|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

