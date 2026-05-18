# AdminAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**adminAlertsGet**](AdminAPI.md#adminalertsget) | **GET** /admin/alerts | List all alert rules (admin)
[**adminAlertsIdDelete**](AdminAPI.md#adminalertsiddelete) | **DELETE** /admin/alerts/{id} | Delete an alert rule (admin)
[**adminAlertsIdPut**](AdminAPI.md#adminalertsidput) | **PUT** /admin/alerts/{id} | Update an alert rule (admin)
[**adminAlertsPost**](AdminAPI.md#adminalertspost) | **POST** /admin/alerts | Create a platform alert rule (admin)
[**adminAuditLogsGet**](AdminAPI.md#adminauditlogsget) | **GET** /admin/audit-logs | List audit logs (admin)
[**adminChurnGet**](AdminAPI.md#adminchurnget) | **GET** /admin/churn | Get churn metrics (admin)
[**adminDeliveriesIdReplayPost**](AdminAPI.md#admindeliveriesidreplaypost) | **POST** /admin/deliveries/{id}/replay | Replay a delivery (admin)
[**adminDeployInfoGet**](AdminAPI.md#admindeployinfoget) | **GET** /admin/deploy-info | Get deploy info
[**adminFeatureFlagsGet**](AdminAPI.md#adminfeatureflagsget) | **GET** /admin/feature-flags | List feature flags
[**adminFeatureFlagsIdDelete**](AdminAPI.md#adminfeatureflagsiddelete) | **DELETE** /admin/feature-flags/{id} | Delete feature flag
[**adminFeatureFlagsIdPut**](AdminAPI.md#adminfeatureflagsidput) | **PUT** /admin/feature-flags/{id} | Update feature flag
[**adminFeatureFlagsPost**](AdminAPI.md#adminfeatureflagspost) | **POST** /admin/feature-flags | Create feature flag
[**adminRevenueExportGet**](AdminAPI.md#adminrevenueexportget) | **GET** /admin/revenue/export | Export revenue data as CSV (admin)
[**adminRevenueGet**](AdminAPI.md#adminrevenueget) | **GET** /admin/revenue | Revenue analytics (admin)
[**adminSdkUpdatePost**](AdminAPI.md#adminsdkupdatepost) | **POST** /admin/sdk-update | Send SDK update notification to users
[**adminSettingsGet**](AdminAPI.md#adminsettingsget) | **GET** /admin/settings | Get platform settings (admin)
[**adminSettingsPut**](AdminAPI.md#adminsettingsput) | **PUT** /admin/settings | Update platform settings (admin)
[**adminStatsGet**](AdminAPI.md#adminstatsget) | **GET** /admin/stats | System-wide statistics (admin)
[**adminTestWebhookPost**](AdminAPI.md#admintestwebhookpost) | **POST** /admin/test-webhook | Send a test webhook to a URL (admin)
[**adminUsersExportGet**](AdminAPI.md#adminusersexportget) | **GET** /admin/users/export | Export users as CSV (admin)
[**adminUsersGet**](AdminAPI.md#adminusersget) | **GET** /admin/users | List all users (admin)
[**adminUsersIdAnalyticsGet**](AdminAPI.md#adminusersidanalyticsget) | **GET** /admin/users/{id}/analytics | Get user analytics (admin)
[**adminUsersIdGet**](AdminAPI.md#adminusersidget) | **GET** /admin/users/{id} | Get user details (admin)
[**adminUsersIdPlanPut**](AdminAPI.md#adminusersidplanput) | **PUT** /admin/users/{id}/plan | Change user plan (admin)
[**adminUsersIdStatusPut**](AdminAPI.md#adminusersidstatusput) | **PUT** /admin/users/{id}/status | Change user status (admin)


# **adminAlertsGet**
```swift
    open class func adminAlertsGet(completion: @escaping (_ data: [AdminAlertRule]?, _ error: Error?) -> Void)
```

List all alert rules (admin)

Returns all alert rules for the authenticated admin's account

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List all alert rules (admin)
AdminAPI.adminAlertsGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**[AdminAlertRule]**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminAlertsIdDelete**
```swift
    open class func adminAlertsIdDelete(id: UUID, completion: @escaping (_ data: AdminAlertsIdDelete200Response?, _ error: Error?) -> Void)
```

Delete an alert rule (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Delete an alert rule (admin)
AdminAPI.adminAlertsIdDelete(id: id) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 

### Return type

[**AdminAlertsIdDelete200Response**](AdminAlertsIdDelete200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminAlertsIdPut**
```swift
    open class func adminAlertsIdPut(id: UUID, adminUpdateAlertRequest: AdminUpdateAlertRequest? = nil, completion: @escaping (_ data: AdminAlertRule?, _ error: Error?) -> Void)
```

Update an alert rule (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let adminUpdateAlertRequest = AdminUpdateAlertRequest(name: "name_example", condition: "condition_example", threshold: 123, channels: ["channels_example"], isActive: false) // AdminUpdateAlertRequest |  (optional)

// Update an alert rule (admin)
AdminAPI.adminAlertsIdPut(id: id, adminUpdateAlertRequest: adminUpdateAlertRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 
 **adminUpdateAlertRequest** | [**AdminUpdateAlertRequest**](AdminUpdateAlertRequest.md) |  | [optional] 

### Return type

[**AdminAlertRule**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminAlertsPost**
```swift
    open class func adminAlertsPost(adminCreateAlertRequest: AdminCreateAlertRequest, completion: @escaping (_ data: AdminAlertRule?, _ error: Error?) -> Void)
```

Create a platform alert rule (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let adminCreateAlertRequest = AdminCreateAlertRequest(customerId: 123, name: "name_example", condition: "condition_example", threshold: 123, channels: ["channels_example"]) // AdminCreateAlertRequest | 

// Create a platform alert rule (admin)
AdminAPI.adminAlertsPost(adminCreateAlertRequest: adminCreateAlertRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **adminCreateAlertRequest** | [**AdminCreateAlertRequest**](AdminCreateAlertRequest.md) |  | 

### Return type

[**AdminAlertRule**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminAuditLogsGet**
```swift
    open class func adminAuditLogsGet(page: Int? = nil, perPage: Int? = nil, action: String? = nil, adminId: UUID? = nil, completion: @escaping (_ data: AdminAuditLogResponse?, _ error: Error?) -> Void)
```

List audit logs (admin)

Returns all audit log entries across all users

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let page = 987 // Int |  (optional) (default to 1)
let perPage = 987 // Int |  (optional) (default to 50)
let action = "action_example" // String |  (optional)
let adminId = 987 // UUID |  (optional)

// List audit logs (admin)
AdminAPI.adminAuditLogsGet(page: page, perPage: perPage, action: action, adminId: adminId) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **Int** |  | [optional] [default to 1]
 **perPage** | **Int** |  | [optional] [default to 50]
 **action** | **String** |  | [optional] 
 **adminId** | **UUID** |  | [optional] 

### Return type

[**AdminAuditLogResponse**](AdminAuditLogResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminChurnGet**
```swift
    open class func adminChurnGet(completion: @escaping (_ data: ChurnResponse?, _ error: Error?) -> Void)
```

Get churn metrics (admin)

Lists users who became inactive in the last 30 days

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get churn metrics (admin)
AdminAPI.adminChurnGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminDeliveriesIdReplayPost**
```swift
    open class func adminDeliveriesIdReplayPost(id: UUID, completion: @escaping (_ data: ReplayDeliveryResponse?, _ error: Error?) -> Void)
```

Replay a delivery (admin)

Creates a new delivery with the same payload as the original

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | Original delivery ID to replay

// Replay a delivery (admin)
AdminAPI.adminDeliveriesIdReplayPost(id: id) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** | Original delivery ID to replay | 

### Return type

[**ReplayDeliveryResponse**](ReplayDeliveryResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminDeployInfoGet**
```swift
    open class func adminDeployInfoGet(completion: @escaping (_ data: DeployInfo?, _ error: Error?) -> Void)
```

Get deploy info

Admin-only. Returns current deployment version and build info.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get deploy info
AdminAPI.adminDeployInfoGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminFeatureFlagsGet**
```swift
    open class func adminFeatureFlagsGet(completion: @escaping (_ data: AdminFeatureFlagsGet200Response?, _ error: Error?) -> Void)
```

List feature flags

Admin-only. Returns all feature flags.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List feature flags
AdminAPI.adminFeatureFlagsGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminFeatureFlagsIdDelete**
```swift
    open class func adminFeatureFlagsIdDelete(id: UUID, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Delete feature flag

Admin-only. Deletes a feature flag.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Delete feature flag
AdminAPI.adminFeatureFlagsIdDelete(id: id) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminFeatureFlagsIdPut**
```swift
    open class func adminFeatureFlagsIdPut(id: UUID, adminFeatureFlagsIdPutRequest: AdminFeatureFlagsIdPutRequest? = nil, completion: @escaping (_ data: FeatureFlag?, _ error: Error?) -> Void)
```

Update feature flag

Admin-only. Updates a feature flag.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let adminFeatureFlagsIdPutRequest = _admin_feature_flags__id__put_request(name: "name_example", description: "description_example", isEnabled: false, rolloutPercentage: 123, enabledForPlans: ["enabledForPlans_example"]) // AdminFeatureFlagsIdPutRequest |  (optional)

// Update feature flag
AdminAPI.adminFeatureFlagsIdPut(id: id, adminFeatureFlagsIdPutRequest: adminFeatureFlagsIdPutRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 
 **adminFeatureFlagsIdPutRequest** | [**AdminFeatureFlagsIdPutRequest**](AdminFeatureFlagsIdPutRequest.md) |  | [optional] 

### Return type

[**FeatureFlag**](FeatureFlag.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminFeatureFlagsPost**
```swift
    open class func adminFeatureFlagsPost(adminFeatureFlagsPostRequest: AdminFeatureFlagsPostRequest, completion: @escaping (_ data: FeatureFlag?, _ error: Error?) -> Void)
```

Create feature flag

Admin-only. Creates a new feature flag.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let adminFeatureFlagsPostRequest = _admin_feature_flags_post_request(name: "name_example", description: "description_example", isEnabled: false, rolloutPercentage: 123, enabledForPlans: ["enabledForPlans_example"]) // AdminFeatureFlagsPostRequest | 

// Create feature flag
AdminAPI.adminFeatureFlagsPost(adminFeatureFlagsPostRequest: adminFeatureFlagsPostRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **adminFeatureFlagsPostRequest** | [**AdminFeatureFlagsPostRequest**](AdminFeatureFlagsPostRequest.md) |  | 

### Return type

[**FeatureFlag**](FeatureFlag.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminRevenueExportGet**
```swift
    open class func adminRevenueExportGet(format: Format_adminRevenueExportGet? = nil, months: Int? = nil, completion: @escaping (_ data: String?, _ error: Error?) -> Void)
```

Export revenue data as CSV (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let format = "format_example" // String |  (optional) (default to .csv)
let months = 987 // Int | Number of months to include (optional) (default to 12)

// Export revenue data as CSV (admin)
AdminAPI.adminRevenueExportGet(format: format, months: months) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **format** | **String** |  | [optional] [default to .csv]
 **months** | **Int** | Number of months to include | [optional] [default to 12]

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/csv

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminRevenueGet**
```swift
    open class func adminRevenueGet(completion: @escaping (_ data: RevenueResponse?, _ error: Error?) -> Void)
```

Revenue analytics (admin)

Returns monthly revenue, revenue by plan, MRR, churn rate, and MRR trend

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Revenue analytics (admin)
AdminAPI.adminRevenueGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminSdkUpdatePost**
```swift
    open class func adminSdkUpdatePost(adminSdkUpdatePostRequest: AdminSdkUpdatePostRequest? = nil, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Send SDK update notification to users

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let adminSdkUpdatePostRequest = _admin_sdk_update_post_request(version: "version_example", message: "message_example") // AdminSdkUpdatePostRequest |  (optional)

// Send SDK update notification to users
AdminAPI.adminSdkUpdatePost(adminSdkUpdatePostRequest: adminSdkUpdatePostRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **adminSdkUpdatePostRequest** | [**AdminSdkUpdatePostRequest**](AdminSdkUpdatePostRequest.md) |  | [optional] 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminSettingsGet**
```swift
    open class func adminSettingsGet(completion: @escaping (_ data: PlatformSettings?, _ error: Error?) -> Void)
```

Get platform settings (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get platform settings (admin)
AdminAPI.adminSettingsGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminSettingsPut**
```swift
    open class func adminSettingsPut(platformSettings: PlatformSettings, completion: @escaping (_ data: AdminSettingsPut200Response?, _ error: Error?) -> Void)
```

Update platform settings (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let platformSettings = PlatformSettings(defaultPlan: "defaultPlan_example", maxEndpointsFree: 123, maxEndpointsPro: 123, maxWebhooksFree: 123, maxWebhooksPro: 123, rateLimitFree: 123, rateLimitPro: 123, retryMaxAttempts: 123, retentionDaysFree: 123, retentionDaysPro: 123, maintenanceMode: false, signupEnabled: false, planPricePro: 123, planPriceBusiness: 123, resendApiKey: "resendApiKey_example", emailSender: "emailSender_example") // PlatformSettings | 

// Update platform settings (admin)
AdminAPI.adminSettingsPut(platformSettings: platformSettings) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **platformSettings** | [**PlatformSettings**](PlatformSettings.md) |  | 

### Return type

[**AdminSettingsPut200Response**](AdminSettingsPut200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminStatsGet**
```swift
    open class func adminStatsGet(completion: @escaping (_ data: SystemStats?, _ error: Error?) -> Void)
```

System-wide statistics (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// System-wide statistics (admin)
AdminAPI.adminStatsGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminTestWebhookPost**
```swift
    open class func adminTestWebhookPost(adminTestWebhookRequest: AdminTestWebhookRequest, completion: @escaping (_ data: AdminTestWebhookResponse?, _ error: Error?) -> Void)
```

Send a test webhook to a URL (admin)

Sends an HTTP POST to the specified URL with SSRF protection

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let adminTestWebhookRequest = AdminTestWebhookRequest(endpointUrl: "endpointUrl_example", eventType: "eventType_example", payload: 123) // AdminTestWebhookRequest | 

// Send a test webhook to a URL (admin)
AdminAPI.adminTestWebhookPost(adminTestWebhookRequest: adminTestWebhookRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **adminTestWebhookRequest** | [**AdminTestWebhookRequest**](AdminTestWebhookRequest.md) |  | 

### Return type

[**AdminTestWebhookResponse**](AdminTestWebhookResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUsersExportGet**
```swift
    open class func adminUsersExportGet(format: Format_adminUsersExportGet? = nil, plan: Plan_adminUsersExportGet? = nil, status: Status_adminUsersExportGet? = nil, completion: @escaping (_ data: String?, _ error: Error?) -> Void)
```

Export users as CSV (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let format = "format_example" // String |  (optional) (default to .csv)
let plan = "plan_example" // String | Filter by plan (optional)
let status = "status_example" // String | Filter by status (optional)

// Export users as CSV (admin)
AdminAPI.adminUsersExportGet(format: format, plan: plan, status: status) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **format** | **String** |  | [optional] [default to .csv]
 **plan** | **String** | Filter by plan | [optional] 
 **status** | **String** | Filter by status | [optional] 

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/csv

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUsersGet**
```swift
    open class func adminUsersGet(page: Int? = nil, perPage: Int? = nil, search: String? = nil, plan: Plan_adminUsersGet? = nil, status: Status_adminUsersGet? = nil, createdAfter: Date? = nil, createdBefore: Date? = nil, completion: @escaping (_ data: PaginatedUsers?, _ error: Error?) -> Void)
```

List all users (admin)

Returns paginated list of users with optional filters

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let page = 987 // Int |  (optional) (default to 1)
let perPage = 987 // Int |  (optional) (default to 20)
let search = "search_example" // String | Search by email or name (ILIKE) (optional)
let plan = "plan_example" // String | Filter by plan (optional)
let status = "status_example" // String | Filter by status (optional)
let createdAfter = Date() // Date | Filter users created after this date (ISO 8601) (optional)
let createdBefore = Date() // Date | Filter users created before this date (ISO 8601) (optional)

// List all users (admin)
AdminAPI.adminUsersGet(page: page, perPage: perPage, search: search, plan: plan, status: status, createdAfter: createdAfter, createdBefore: createdBefore) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **Int** |  | [optional] [default to 1]
 **perPage** | **Int** |  | [optional] [default to 20]
 **search** | **String** | Search by email or name (ILIKE) | [optional] 
 **plan** | **String** | Filter by plan | [optional] 
 **status** | **String** | Filter by status | [optional] 
 **createdAfter** | **Date** | Filter users created after this date (ISO 8601) | [optional] 
 **createdBefore** | **Date** | Filter users created before this date (ISO 8601) | [optional] 

### Return type

[**PaginatedUsers**](PaginatedUsers.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUsersIdAnalyticsGet**
```swift
    open class func adminUsersIdAnalyticsGet(id: UUID, days: Int? = nil, completion: @escaping (_ data: UserAnalytics?, _ error: Error?) -> Void)
```

Get user analytics (admin)

Returns delivery analytics for a specific user over a time period

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let days = 987 // Int | Number of days to analyze (optional) (default to 30)

// Get user analytics (admin)
AdminAPI.adminUsersIdAnalyticsGet(id: id, days: days) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 
 **days** | **Int** | Number of days to analyze | [optional] [default to 30]

### Return type

[**UserAnalytics**](UserAnalytics.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUsersIdGet**
```swift
    open class func adminUsersIdGet(id: UUID, completion: @escaping (_ data: AdminUsersIdGet200Response?, _ error: Error?) -> Void)
```

Get user details (admin)

Returns user details with endpoints, recent deliveries, and usage stats

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Get user details (admin)
AdminAPI.adminUsersIdGet(id: id) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 

### Return type

[**AdminUsersIdGet200Response**](AdminUsersIdGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUsersIdPlanPut**
```swift
    open class func adminUsersIdPlanPut(id: UUID, adminUsersIdPlanPutRequest: AdminUsersIdPlanPutRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Change user plan (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let adminUsersIdPlanPutRequest = _admin_users__id__plan_put_request(plan: "plan_example") // AdminUsersIdPlanPutRequest | 

// Change user plan (admin)
AdminAPI.adminUsersIdPlanPut(id: id, adminUsersIdPlanPutRequest: adminUsersIdPlanPutRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 
 **adminUsersIdPlanPutRequest** | [**AdminUsersIdPlanPutRequest**](AdminUsersIdPlanPutRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUsersIdStatusPut**
```swift
    open class func adminUsersIdStatusPut(id: UUID, adminUsersIdStatusPutRequest: AdminUsersIdStatusPutRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Change user status (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let adminUsersIdStatusPutRequest = _admin_users__id__status_put_request(isActive: false) // AdminUsersIdStatusPutRequest | 

// Change user status (admin)
AdminAPI.adminUsersIdStatusPut(id: id, adminUsersIdStatusPutRequest: adminUsersIdStatusPutRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 
 **adminUsersIdStatusPutRequest** | [**AdminUsersIdStatusPutRequest**](AdminUsersIdStatusPutRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

