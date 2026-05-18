# hooksniff.Api.AdminApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**AdminAlertsGet**](AdminApi.md#adminalertsget) | **GET** /admin/alerts | List all alert rules (admin) |
| [**AdminAlertsIdDelete**](AdminApi.md#adminalertsiddelete) | **DELETE** /admin/alerts/{id} | Delete an alert rule (admin) |
| [**AdminAlertsIdPut**](AdminApi.md#adminalertsidput) | **PUT** /admin/alerts/{id} | Update an alert rule (admin) |
| [**AdminAlertsPost**](AdminApi.md#adminalertspost) | **POST** /admin/alerts | Create a platform alert rule (admin) |
| [**AdminAuditLogsGet**](AdminApi.md#adminauditlogsget) | **GET** /admin/audit-logs | List audit logs (admin) |
| [**AdminChurnGet**](AdminApi.md#adminchurnget) | **GET** /admin/churn | Get churn metrics (admin) |
| [**AdminDeliveriesIdReplayPost**](AdminApi.md#admindeliveriesidreplaypost) | **POST** /admin/deliveries/{id}/replay | Replay a delivery (admin) |
| [**AdminDeployInfoGet**](AdminApi.md#admindeployinfoget) | **GET** /admin/deploy-info | Get deploy info |
| [**AdminFeatureFlagsGet**](AdminApi.md#adminfeatureflagsget) | **GET** /admin/feature-flags | List feature flags |
| [**AdminFeatureFlagsIdDelete**](AdminApi.md#adminfeatureflagsiddelete) | **DELETE** /admin/feature-flags/{id} | Delete feature flag |
| [**AdminFeatureFlagsIdPut**](AdminApi.md#adminfeatureflagsidput) | **PUT** /admin/feature-flags/{id} | Update feature flag |
| [**AdminFeatureFlagsPost**](AdminApi.md#adminfeatureflagspost) | **POST** /admin/feature-flags | Create feature flag |
| [**AdminRevenueExportGet**](AdminApi.md#adminrevenueexportget) | **GET** /admin/revenue/export | Export revenue data as CSV (admin) |
| [**AdminRevenueGet**](AdminApi.md#adminrevenueget) | **GET** /admin/revenue | Revenue analytics (admin) |
| [**AdminSdkUpdatePost**](AdminApi.md#adminsdkupdatepost) | **POST** /admin/sdk-update | Send SDK update notification to users |
| [**AdminSettingsGet**](AdminApi.md#adminsettingsget) | **GET** /admin/settings | Get platform settings (admin) |
| [**AdminSettingsPut**](AdminApi.md#adminsettingsput) | **PUT** /admin/settings | Update platform settings (admin) |
| [**AdminStatsGet**](AdminApi.md#adminstatsget) | **GET** /admin/stats | System-wide statistics (admin) |
| [**AdminTestWebhookPost**](AdminApi.md#admintestwebhookpost) | **POST** /admin/test-webhook | Send a test webhook to a URL (admin) |
| [**AdminUsersExportGet**](AdminApi.md#adminusersexportget) | **GET** /admin/users/export | Export users as CSV (admin) |
| [**AdminUsersGet**](AdminApi.md#adminusersget) | **GET** /admin/users | List all users (admin) |
| [**AdminUsersIdAnalyticsGet**](AdminApi.md#adminusersidanalyticsget) | **GET** /admin/users/{id}/analytics | Get user analytics (admin) |
| [**AdminUsersIdGet**](AdminApi.md#adminusersidget) | **GET** /admin/users/{id} | Get user details (admin) |
| [**AdminUsersIdPlanPut**](AdminApi.md#adminusersidplanput) | **PUT** /admin/users/{id}/plan | Change user plan (admin) |
| [**AdminUsersIdStatusPut**](AdminApi.md#adminusersidstatusput) | **PUT** /admin/users/{id}/status | Change user status (admin) |

<a id="adminalertsget"></a>
# **AdminAlertsGet**
> List&lt;AdminAlertRule&gt; AdminAlertsGet ()

List all alert rules (admin)

Returns all alert rules for the authenticated admin's account


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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminalertsiddelete"></a>
# **AdminAlertsIdDelete**
> AdminAlertsIdDelete200Response AdminAlertsIdDelete (Guid id)

Delete an alert rule (admin)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminalertsidput"></a>
# **AdminAlertsIdPut**
> AdminAlertRule AdminAlertsIdPut (Guid id, AdminUpdateAlertRequest adminUpdateAlertRequest = null)

Update an alert rule (admin)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **adminUpdateAlertRequest** | [**AdminUpdateAlertRequest**](AdminUpdateAlertRequest.md) |  | [optional]  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminalertspost"></a>
# **AdminAlertsPost**
> AdminAlertRule AdminAlertsPost (AdminCreateAlertRequest adminCreateAlertRequest)

Create a platform alert rule (admin)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **adminCreateAlertRequest** | [**AdminCreateAlertRequest**](AdminCreateAlertRequest.md) |  |  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminauditlogsget"></a>
# **AdminAuditLogsGet**
> AdminAuditLogResponse AdminAuditLogsGet (int page = null, int perPage = null, string action = null, Guid adminId = null)

List audit logs (admin)

Returns all audit log entries across all users


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **page** | **int** |  | [optional] [default to 1] |
| **perPage** | **int** |  | [optional] [default to 50] |
| **action** | **string** |  | [optional]  |
| **adminId** | **Guid** |  | [optional]  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminchurnget"></a>
# **AdminChurnGet**
> ChurnResponse AdminChurnGet ()

Get churn metrics (admin)

Lists users who became inactive in the last 30 days


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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="admindeliveriesidreplaypost"></a>
# **AdminDeliveriesIdReplayPost**
> ReplayDeliveryResponse AdminDeliveriesIdReplayPost (Guid id)

Replay a delivery (admin)

Creates a new delivery with the same payload as the original


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** | Original delivery ID to replay |  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="admindeployinfoget"></a>
# **AdminDeployInfoGet**
> DeployInfo AdminDeployInfoGet ()

Get deploy info

Admin-only. Returns current deployment version and build info.


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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminfeatureflagsget"></a>
# **AdminFeatureFlagsGet**
> AdminFeatureFlagsGet200Response AdminFeatureFlagsGet ()

List feature flags

Admin-only. Returns all feature flags.


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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminfeatureflagsiddelete"></a>
# **AdminFeatureFlagsIdDelete**
> void AdminFeatureFlagsIdDelete (Guid id)

Delete feature flag

Admin-only. Deletes a feature flag.


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

void (empty response body)

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminfeatureflagsidput"></a>
# **AdminFeatureFlagsIdPut**
> FeatureFlag AdminFeatureFlagsIdPut (Guid id, AdminFeatureFlagsIdPutRequest adminFeatureFlagsIdPutRequest = null)

Update feature flag

Admin-only. Updates a feature flag.


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **adminFeatureFlagsIdPutRequest** | [**AdminFeatureFlagsIdPutRequest**](AdminFeatureFlagsIdPutRequest.md) |  | [optional]  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminfeatureflagspost"></a>
# **AdminFeatureFlagsPost**
> FeatureFlag AdminFeatureFlagsPost (AdminFeatureFlagsPostRequest adminFeatureFlagsPostRequest)

Create feature flag

Admin-only. Creates a new feature flag.


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **adminFeatureFlagsPostRequest** | [**AdminFeatureFlagsPostRequest**](AdminFeatureFlagsPostRequest.md) |  |  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminrevenueexportget"></a>
# **AdminRevenueExportGet**
> string AdminRevenueExportGet (string format = null, int months = null)

Export revenue data as CSV (admin)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **format** | **string** |  | [optional] [default to csv] |
| **months** | **int** | Number of months to include | [optional] [default to 12] |

### Return type

**string**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/csv


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Revenue CSV export |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminrevenueget"></a>
# **AdminRevenueGet**
> RevenueResponse AdminRevenueGet ()

Revenue analytics (admin)

Returns monthly revenue, revenue by plan, MRR, churn rate, and MRR trend


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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminsdkupdatepost"></a>
# **AdminSdkUpdatePost**
> void AdminSdkUpdatePost (AdminSdkUpdatePostRequest adminSdkUpdatePostRequest = null)

Send SDK update notification to users


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **adminSdkUpdatePostRequest** | [**AdminSdkUpdatePostRequest**](AdminSdkUpdatePostRequest.md) |  | [optional]  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Notification sent |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminsettingsget"></a>
# **AdminSettingsGet**
> PlatformSettings AdminSettingsGet ()

Get platform settings (admin)


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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminsettingsput"></a>
# **AdminSettingsPut**
> AdminSettingsPut200Response AdminSettingsPut (PlatformSettings platformSettings)

Update platform settings (admin)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **platformSettings** | [**PlatformSettings**](PlatformSettings.md) |  |  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminstatsget"></a>
# **AdminStatsGet**
> SystemStats AdminStatsGet ()

System-wide statistics (admin)


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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="admintestwebhookpost"></a>
# **AdminTestWebhookPost**
> AdminTestWebhookResponse AdminTestWebhookPost (AdminTestWebhookRequest adminTestWebhookRequest)

Send a test webhook to a URL (admin)

Sends an HTTP POST to the specified URL with SSRF protection


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **adminTestWebhookRequest** | [**AdminTestWebhookRequest**](AdminTestWebhookRequest.md) |  |  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminusersexportget"></a>
# **AdminUsersExportGet**
> string AdminUsersExportGet (string format = null, string plan = null, string status = null)

Export users as CSV (admin)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **format** | **string** |  | [optional] [default to csv] |
| **plan** | **string** | Filter by plan | [optional]  |
| **status** | **string** | Filter by status | [optional]  |

### Return type

**string**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/csv


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Users CSV export |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminusersget"></a>
# **AdminUsersGet**
> PaginatedUsers AdminUsersGet (int page = null, int perPage = null, string search = null, string plan = null, string status = null, DateOnly createdAfter = null, DateOnly createdBefore = null)

List all users (admin)

Returns paginated list of users with optional filters


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **page** | **int** |  | [optional] [default to 1] |
| **perPage** | **int** |  | [optional] [default to 20] |
| **search** | **string** | Search by email or name (ILIKE) | [optional]  |
| **plan** | **string** | Filter by plan | [optional]  |
| **status** | **string** | Filter by status | [optional]  |
| **createdAfter** | **DateOnly** | Filter users created after this date (ISO 8601) | [optional]  |
| **createdBefore** | **DateOnly** | Filter users created before this date (ISO 8601) | [optional]  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminusersidanalyticsget"></a>
# **AdminUsersIdAnalyticsGet**
> UserAnalytics AdminUsersIdAnalyticsGet (Guid id, int days = null)

Get user analytics (admin)

Returns delivery analytics for a specific user over a time period


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **days** | **int** | Number of days to analyze | [optional] [default to 30] |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminusersidget"></a>
# **AdminUsersIdGet**
> AdminUsersIdGet200Response AdminUsersIdGet (Guid id)

Get user details (admin)

Returns user details with endpoints, recent deliveries, and usage stats


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

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

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminusersidplanput"></a>
# **AdminUsersIdPlanPut**
> void AdminUsersIdPlanPut (Guid id, AdminUsersIdPlanPutRequest adminUsersIdPlanPutRequest)

Change user plan (admin)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **adminUsersIdPlanPutRequest** | [**AdminUsersIdPlanPutRequest**](AdminUsersIdPlanPutRequest.md) |  |  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Plan changed |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminusersidstatusput"></a>
# **AdminUsersIdStatusPut**
> void AdminUsersIdStatusPut (Guid id, AdminUsersIdStatusPutRequest adminUsersIdStatusPutRequest)

Change user status (admin)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **adminUsersIdStatusPutRequest** | [**AdminUsersIdStatusPutRequest**](AdminUsersIdStatusPutRequest.md) |  |  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Status changed |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

