# \AdminApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**admin_alerts_get**](AdminApi.md#admin_alerts_get) | **GET** /admin/alerts | List all alert rules (admin)
[**admin_alerts_id_delete**](AdminApi.md#admin_alerts_id_delete) | **DELETE** /admin/alerts/{id} | Delete an alert rule (admin)
[**admin_alerts_id_put**](AdminApi.md#admin_alerts_id_put) | **PUT** /admin/alerts/{id} | Update an alert rule (admin)
[**admin_alerts_post**](AdminApi.md#admin_alerts_post) | **POST** /admin/alerts | Create a platform alert rule (admin)
[**admin_audit_logs_get**](AdminApi.md#admin_audit_logs_get) | **GET** /admin/audit-logs | List audit logs (admin)
[**admin_churn_get**](AdminApi.md#admin_churn_get) | **GET** /admin/churn | Get churn metrics (admin)
[**admin_deliveries_id_replay_post**](AdminApi.md#admin_deliveries_id_replay_post) | **POST** /admin/deliveries/{id}/replay | Replay a delivery (admin)
[**admin_deploy_info_get**](AdminApi.md#admin_deploy_info_get) | **GET** /admin/deploy-info | Get deploy info
[**admin_feature_flags_get**](AdminApi.md#admin_feature_flags_get) | **GET** /admin/feature-flags | List feature flags
[**admin_feature_flags_id_delete**](AdminApi.md#admin_feature_flags_id_delete) | **DELETE** /admin/feature-flags/{id} | Delete feature flag
[**admin_feature_flags_id_put**](AdminApi.md#admin_feature_flags_id_put) | **PUT** /admin/feature-flags/{id} | Update feature flag
[**admin_feature_flags_post**](AdminApi.md#admin_feature_flags_post) | **POST** /admin/feature-flags | Create feature flag
[**admin_revenue_export_get**](AdminApi.md#admin_revenue_export_get) | **GET** /admin/revenue/export | Export revenue data as CSV (admin)
[**admin_revenue_get**](AdminApi.md#admin_revenue_get) | **GET** /admin/revenue | Revenue analytics (admin)
[**admin_sdk_update_post**](AdminApi.md#admin_sdk_update_post) | **POST** /admin/sdk-update | Send SDK update notification to users
[**admin_settings_get**](AdminApi.md#admin_settings_get) | **GET** /admin/settings | Get platform settings (admin)
[**admin_settings_put**](AdminApi.md#admin_settings_put) | **PUT** /admin/settings | Update platform settings (admin)
[**admin_stats_get**](AdminApi.md#admin_stats_get) | **GET** /admin/stats | System-wide statistics (admin)
[**admin_test_webhook_post**](AdminApi.md#admin_test_webhook_post) | **POST** /admin/test-webhook | Send a test webhook to a URL (admin)
[**admin_users_export_get**](AdminApi.md#admin_users_export_get) | **GET** /admin/users/export | Export users as CSV (admin)
[**admin_users_get**](AdminApi.md#admin_users_get) | **GET** /admin/users | List all users (admin)
[**admin_users_id_analytics_get**](AdminApi.md#admin_users_id_analytics_get) | **GET** /admin/users/{id}/analytics | Get user analytics (admin)
[**admin_users_id_get**](AdminApi.md#admin_users_id_get) | **GET** /admin/users/{id} | Get user details (admin)
[**admin_users_id_plan_put**](AdminApi.md#admin_users_id_plan_put) | **PUT** /admin/users/{id}/plan | Change user plan (admin)
[**admin_users_id_status_put**](AdminApi.md#admin_users_id_status_put) | **PUT** /admin/users/{id}/status | Change user status (admin)



## admin_alerts_get

> Vec<models::AdminAlertRule> admin_alerts_get()
List all alert rules (admin)

Returns all alert rules for the authenticated admin's account

### Parameters

This endpoint does not need any parameter.

### Return type

[**Vec<models::AdminAlertRule>**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_alerts_id_delete

> models::AdminAlertsIdDelete200Response admin_alerts_id_delete(id)
Delete an alert rule (admin)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

[**models::AdminAlertsIdDelete200Response**](_admin_alerts__id__delete_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_alerts_id_put

> models::AdminAlertRule admin_alerts_id_put(id, admin_update_alert_request)
Update an alert rule (admin)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**admin_update_alert_request** | Option<[**AdminUpdateAlertRequest**](AdminUpdateAlertRequest.md)> |  |  |

### Return type

[**models::AdminAlertRule**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_alerts_post

> models::AdminAlertRule admin_alerts_post(admin_create_alert_request)
Create a platform alert rule (admin)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**admin_create_alert_request** | [**AdminCreateAlertRequest**](AdminCreateAlertRequest.md) |  | [required] |

### Return type

[**models::AdminAlertRule**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_audit_logs_get

> models::AdminAuditLogResponse admin_audit_logs_get(page, per_page, action, admin_id)
List audit logs (admin)

Returns all audit log entries across all users

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**page** | Option<**i32**> |  |  |[default to 1]
**per_page** | Option<**i32**> |  |  |[default to 50]
**action** | Option<**String**> |  |  |
**admin_id** | Option<**uuid::Uuid**> |  |  |

### Return type

[**models::AdminAuditLogResponse**](AdminAuditLogResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_churn_get

> models::ChurnResponse admin_churn_get()
Get churn metrics (admin)

Lists users who became inactive in the last 30 days

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::ChurnResponse**](ChurnResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_deliveries_id_replay_post

> models::ReplayDeliveryResponse admin_deliveries_id_replay_post(id)
Replay a delivery (admin)

Creates a new delivery with the same payload as the original

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** | Original delivery ID to replay | [required] |

### Return type

[**models::ReplayDeliveryResponse**](ReplayDeliveryResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_deploy_info_get

> models::DeployInfo admin_deploy_info_get()
Get deploy info

Admin-only. Returns current deployment version and build info.

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::DeployInfo**](DeployInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_feature_flags_get

> models::AdminFeatureFlagsGet200Response admin_feature_flags_get()
List feature flags

Admin-only. Returns all feature flags.

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::AdminFeatureFlagsGet200Response**](_admin_feature_flags_get_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_feature_flags_id_delete

> admin_feature_flags_id_delete(id)
Delete feature flag

Admin-only. Deletes a feature flag.

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_feature_flags_id_put

> models::FeatureFlag admin_feature_flags_id_put(id, admin_feature_flags_id_put_request)
Update feature flag

Admin-only. Updates a feature flag.

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**admin_feature_flags_id_put_request** | Option<[**AdminFeatureFlagsIdPutRequest**](AdminFeatureFlagsIdPutRequest.md)> |  |  |

### Return type

[**models::FeatureFlag**](FeatureFlag.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_feature_flags_post

> models::FeatureFlag admin_feature_flags_post(admin_feature_flags_post_request)
Create feature flag

Admin-only. Creates a new feature flag.

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**admin_feature_flags_post_request** | [**AdminFeatureFlagsPostRequest**](AdminFeatureFlagsPostRequest.md) |  | [required] |

### Return type

[**models::FeatureFlag**](FeatureFlag.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_revenue_export_get

> String admin_revenue_export_get(format, months)
Export revenue data as CSV (admin)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**format** | Option<**String**> |  |  |[default to csv]
**months** | Option<**i32**> | Number of months to include |  |[default to 12]

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/csv

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_revenue_get

> models::RevenueResponse admin_revenue_get()
Revenue analytics (admin)

Returns monthly revenue, revenue by plan, MRR, churn rate, and MRR trend

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::RevenueResponse**](RevenueResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_sdk_update_post

> admin_sdk_update_post(admin_sdk_update_post_request)
Send SDK update notification to users

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**admin_sdk_update_post_request** | Option<[**AdminSdkUpdatePostRequest**](AdminSdkUpdatePostRequest.md)> |  |  |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_settings_get

> models::PlatformSettings admin_settings_get()
Get platform settings (admin)

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::PlatformSettings**](PlatformSettings.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_settings_put

> models::AdminSettingsPut200Response admin_settings_put(platform_settings)
Update platform settings (admin)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**platform_settings** | [**PlatformSettings**](PlatformSettings.md) |  | [required] |

### Return type

[**models::AdminSettingsPut200Response**](_admin_settings_put_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_stats_get

> models::SystemStats admin_stats_get()
System-wide statistics (admin)

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::SystemStats**](SystemStats.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_test_webhook_post

> models::AdminTestWebhookResponse admin_test_webhook_post(admin_test_webhook_request)
Send a test webhook to a URL (admin)

Sends an HTTP POST to the specified URL with SSRF protection

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**admin_test_webhook_request** | [**AdminTestWebhookRequest**](AdminTestWebhookRequest.md) |  | [required] |

### Return type

[**models::AdminTestWebhookResponse**](AdminTestWebhookResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_users_export_get

> String admin_users_export_get(format, plan, status)
Export users as CSV (admin)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**format** | Option<**String**> |  |  |[default to csv]
**plan** | Option<**String**> | Filter by plan |  |
**status** | Option<**String**> | Filter by status |  |

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/csv

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_users_get

> models::PaginatedUsers admin_users_get(page, per_page, search, plan, status, created_after, created_before)
List all users (admin)

Returns paginated list of users with optional filters

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**page** | Option<**i32**> |  |  |[default to 1]
**per_page** | Option<**i32**> |  |  |[default to 20]
**search** | Option<**String**> | Search by email or name (ILIKE) |  |
**plan** | Option<**String**> | Filter by plan |  |
**status** | Option<**String**> | Filter by status |  |
**created_after** | Option<**chrono::NaiveDate**> | Filter users created after this date (ISO 8601) |  |
**created_before** | Option<**chrono::NaiveDate**> | Filter users created before this date (ISO 8601) |  |

### Return type

[**models::PaginatedUsers**](PaginatedUsers.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_users_id_analytics_get

> models::UserAnalytics admin_users_id_analytics_get(id, days)
Get user analytics (admin)

Returns delivery analytics for a specific user over a time period

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**days** | Option<**i32**> | Number of days to analyze |  |[default to 30]

### Return type

[**models::UserAnalytics**](UserAnalytics.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_users_id_get

> models::AdminUsersIdGet200Response admin_users_id_get(id)
Get user details (admin)

Returns user details with endpoints, recent deliveries, and usage stats

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

[**models::AdminUsersIdGet200Response**](_admin_users__id__get_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_users_id_plan_put

> admin_users_id_plan_put(id, admin_users_id_plan_put_request)
Change user plan (admin)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**admin_users_id_plan_put_request** | [**AdminUsersIdPlanPutRequest**](AdminUsersIdPlanPutRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_users_id_status_put

> admin_users_id_status_put(id, admin_users_id_status_put_request)
Change user status (admin)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**admin_users_id_status_put_request** | [**AdminUsersIdStatusPutRequest**](AdminUsersIdStatusPutRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

