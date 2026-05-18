# OpenAPI\Client\AdminApi

Admin-only user and system management

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**adminAlertsGet()**](AdminApi.md#adminAlertsGet) | **GET** /admin/alerts | List all alert rules (admin) |
| [**adminAlertsIdDelete()**](AdminApi.md#adminAlertsIdDelete) | **DELETE** /admin/alerts/{id} | Delete an alert rule (admin) |
| [**adminAlertsIdPut()**](AdminApi.md#adminAlertsIdPut) | **PUT** /admin/alerts/{id} | Update an alert rule (admin) |
| [**adminAlertsPost()**](AdminApi.md#adminAlertsPost) | **POST** /admin/alerts | Create a platform alert rule (admin) |
| [**adminAuditLogsGet()**](AdminApi.md#adminAuditLogsGet) | **GET** /admin/audit-logs | List audit logs (admin) |
| [**adminChurnGet()**](AdminApi.md#adminChurnGet) | **GET** /admin/churn | Get churn metrics (admin) |
| [**adminDeliveriesIdReplayPost()**](AdminApi.md#adminDeliveriesIdReplayPost) | **POST** /admin/deliveries/{id}/replay | Replay a delivery (admin) |
| [**adminDeployInfoGet()**](AdminApi.md#adminDeployInfoGet) | **GET** /admin/deploy-info | Get deploy info |
| [**adminFeatureFlagsGet()**](AdminApi.md#adminFeatureFlagsGet) | **GET** /admin/feature-flags | List feature flags |
| [**adminFeatureFlagsIdDelete()**](AdminApi.md#adminFeatureFlagsIdDelete) | **DELETE** /admin/feature-flags/{id} | Delete feature flag |
| [**adminFeatureFlagsIdPut()**](AdminApi.md#adminFeatureFlagsIdPut) | **PUT** /admin/feature-flags/{id} | Update feature flag |
| [**adminFeatureFlagsPost()**](AdminApi.md#adminFeatureFlagsPost) | **POST** /admin/feature-flags | Create feature flag |
| [**adminRevenueExportGet()**](AdminApi.md#adminRevenueExportGet) | **GET** /admin/revenue/export | Export revenue data as CSV (admin) |
| [**adminRevenueGet()**](AdminApi.md#adminRevenueGet) | **GET** /admin/revenue | Revenue analytics (admin) |
| [**adminSdkUpdatePost()**](AdminApi.md#adminSdkUpdatePost) | **POST** /admin/sdk-update | Send SDK update notification to users |
| [**adminSettingsGet()**](AdminApi.md#adminSettingsGet) | **GET** /admin/settings | Get platform settings (admin) |
| [**adminSettingsPut()**](AdminApi.md#adminSettingsPut) | **PUT** /admin/settings | Update platform settings (admin) |
| [**adminStatsGet()**](AdminApi.md#adminStatsGet) | **GET** /admin/stats | System-wide statistics (admin) |
| [**adminTestWebhookPost()**](AdminApi.md#adminTestWebhookPost) | **POST** /admin/test-webhook | Send a test webhook to a URL (admin) |
| [**adminUsersExportGet()**](AdminApi.md#adminUsersExportGet) | **GET** /admin/users/export | Export users as CSV (admin) |
| [**adminUsersGet()**](AdminApi.md#adminUsersGet) | **GET** /admin/users | List all users (admin) |
| [**adminUsersIdAnalyticsGet()**](AdminApi.md#adminUsersIdAnalyticsGet) | **GET** /admin/users/{id}/analytics | Get user analytics (admin) |
| [**adminUsersIdGet()**](AdminApi.md#adminUsersIdGet) | **GET** /admin/users/{id} | Get user details (admin) |
| [**adminUsersIdPlanPut()**](AdminApi.md#adminUsersIdPlanPut) | **PUT** /admin/users/{id}/plan | Change user plan (admin) |
| [**adminUsersIdStatusPut()**](AdminApi.md#adminUsersIdStatusPut) | **PUT** /admin/users/{id}/status | Change user status (admin) |


## `adminAlertsGet()`

```php
adminAlertsGet(): \OpenAPI\Client\Model\AdminAlertRule[]
```

List all alert rules (admin)

Returns all alert rules for the authenticated admin's account

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->adminAlertsGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminAlertsGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\AdminAlertRule[]**](../Model/AdminAlertRule.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminAlertsIdDelete()`

```php
adminAlertsIdDelete($id): \OpenAPI\Client\Model\AdminAlertsIdDelete200Response
```

Delete an alert rule (admin)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $result = $apiInstance->adminAlertsIdDelete($id);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminAlertsIdDelete: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |

### Return type

[**\OpenAPI\Client\Model\AdminAlertsIdDelete200Response**](../Model/AdminAlertsIdDelete200Response.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminAlertsIdPut()`

```php
adminAlertsIdPut($id, $admin_update_alert_request): \OpenAPI\Client\Model\AdminAlertRule
```

Update an alert rule (admin)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$admin_update_alert_request = new \OpenAPI\Client\Model\AdminUpdateAlertRequest(); // \OpenAPI\Client\Model\AdminUpdateAlertRequest

try {
    $result = $apiInstance->adminAlertsIdPut($id, $admin_update_alert_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminAlertsIdPut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **admin_update_alert_request** | [**\OpenAPI\Client\Model\AdminUpdateAlertRequest**](../Model/AdminUpdateAlertRequest.md)|  | [optional] |

### Return type

[**\OpenAPI\Client\Model\AdminAlertRule**](../Model/AdminAlertRule.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminAlertsPost()`

```php
adminAlertsPost($admin_create_alert_request): \OpenAPI\Client\Model\AdminAlertRule
```

Create a platform alert rule (admin)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$admin_create_alert_request = new \OpenAPI\Client\Model\AdminCreateAlertRequest(); // \OpenAPI\Client\Model\AdminCreateAlertRequest

try {
    $result = $apiInstance->adminAlertsPost($admin_create_alert_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminAlertsPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **admin_create_alert_request** | [**\OpenAPI\Client\Model\AdminCreateAlertRequest**](../Model/AdminCreateAlertRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\AdminAlertRule**](../Model/AdminAlertRule.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminAuditLogsGet()`

```php
adminAuditLogsGet($page, $per_page, $action, $admin_id): \OpenAPI\Client\Model\AdminAuditLogResponse
```

List audit logs (admin)

Returns all audit log entries across all users

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$page = 1; // int
$per_page = 50; // int
$action = 'action_example'; // string
$admin_id = 'admin_id_example'; // string

try {
    $result = $apiInstance->adminAuditLogsGet($page, $per_page, $action, $admin_id);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminAuditLogsGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **page** | **int**|  | [optional] [default to 1] |
| **per_page** | **int**|  | [optional] [default to 50] |
| **action** | **string**|  | [optional] |
| **admin_id** | **string**|  | [optional] |

### Return type

[**\OpenAPI\Client\Model\AdminAuditLogResponse**](../Model/AdminAuditLogResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminChurnGet()`

```php
adminChurnGet(): \OpenAPI\Client\Model\ChurnResponse
```

Get churn metrics (admin)

Lists users who became inactive in the last 30 days

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->adminChurnGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminChurnGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\ChurnResponse**](../Model/ChurnResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminDeliveriesIdReplayPost()`

```php
adminDeliveriesIdReplayPost($id): \OpenAPI\Client\Model\ReplayDeliveryResponse
```

Replay a delivery (admin)

Creates a new delivery with the same payload as the original

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string | Original delivery ID to replay

try {
    $result = $apiInstance->adminDeliveriesIdReplayPost($id);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminDeliveriesIdReplayPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**| Original delivery ID to replay | |

### Return type

[**\OpenAPI\Client\Model\ReplayDeliveryResponse**](../Model/ReplayDeliveryResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminDeployInfoGet()`

```php
adminDeployInfoGet(): \OpenAPI\Client\Model\DeployInfo
```

Get deploy info

Admin-only. Returns current deployment version and build info.

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->adminDeployInfoGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminDeployInfoGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\DeployInfo**](../Model/DeployInfo.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminFeatureFlagsGet()`

```php
adminFeatureFlagsGet(): \OpenAPI\Client\Model\AdminFeatureFlagsGet200Response
```

List feature flags

Admin-only. Returns all feature flags.

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->adminFeatureFlagsGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminFeatureFlagsGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\AdminFeatureFlagsGet200Response**](../Model/AdminFeatureFlagsGet200Response.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminFeatureFlagsIdDelete()`

```php
adminFeatureFlagsIdDelete($id)
```

Delete feature flag

Admin-only. Deletes a feature flag.

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $apiInstance->adminFeatureFlagsIdDelete($id);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminFeatureFlagsIdDelete: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminFeatureFlagsIdPut()`

```php
adminFeatureFlagsIdPut($id, $admin_feature_flags_id_put_request): \OpenAPI\Client\Model\FeatureFlag
```

Update feature flag

Admin-only. Updates a feature flag.

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$admin_feature_flags_id_put_request = new \OpenAPI\Client\Model\AdminFeatureFlagsIdPutRequest(); // \OpenAPI\Client\Model\AdminFeatureFlagsIdPutRequest

try {
    $result = $apiInstance->adminFeatureFlagsIdPut($id, $admin_feature_flags_id_put_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminFeatureFlagsIdPut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **admin_feature_flags_id_put_request** | [**\OpenAPI\Client\Model\AdminFeatureFlagsIdPutRequest**](../Model/AdminFeatureFlagsIdPutRequest.md)|  | [optional] |

### Return type

[**\OpenAPI\Client\Model\FeatureFlag**](../Model/FeatureFlag.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminFeatureFlagsPost()`

```php
adminFeatureFlagsPost($admin_feature_flags_post_request): \OpenAPI\Client\Model\FeatureFlag
```

Create feature flag

Admin-only. Creates a new feature flag.

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$admin_feature_flags_post_request = new \OpenAPI\Client\Model\AdminFeatureFlagsPostRequest(); // \OpenAPI\Client\Model\AdminFeatureFlagsPostRequest

try {
    $result = $apiInstance->adminFeatureFlagsPost($admin_feature_flags_post_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminFeatureFlagsPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **admin_feature_flags_post_request** | [**\OpenAPI\Client\Model\AdminFeatureFlagsPostRequest**](../Model/AdminFeatureFlagsPostRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\FeatureFlag**](../Model/FeatureFlag.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminRevenueExportGet()`

```php
adminRevenueExportGet($format, $months): string
```

Export revenue data as CSV (admin)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$format = 'csv'; // string
$months = 12; // int | Number of months to include

try {
    $result = $apiInstance->adminRevenueExportGet($format, $months);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminRevenueExportGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **format** | **string**|  | [optional] [default to &#39;csv&#39;] |
| **months** | **int**| Number of months to include | [optional] [default to 12] |

### Return type

**string**

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/csv`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminRevenueGet()`

```php
adminRevenueGet(): \OpenAPI\Client\Model\RevenueResponse
```

Revenue analytics (admin)

Returns monthly revenue, revenue by plan, MRR, churn rate, and MRR trend

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->adminRevenueGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminRevenueGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\RevenueResponse**](../Model/RevenueResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminSdkUpdatePost()`

```php
adminSdkUpdatePost($admin_sdk_update_post_request)
```

Send SDK update notification to users

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$admin_sdk_update_post_request = new \OpenAPI\Client\Model\AdminSdkUpdatePostRequest(); // \OpenAPI\Client\Model\AdminSdkUpdatePostRequest

try {
    $apiInstance->adminSdkUpdatePost($admin_sdk_update_post_request);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminSdkUpdatePost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **admin_sdk_update_post_request** | [**\OpenAPI\Client\Model\AdminSdkUpdatePostRequest**](../Model/AdminSdkUpdatePostRequest.md)|  | [optional] |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminSettingsGet()`

```php
adminSettingsGet(): \OpenAPI\Client\Model\PlatformSettings
```

Get platform settings (admin)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->adminSettingsGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminSettingsGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\PlatformSettings**](../Model/PlatformSettings.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminSettingsPut()`

```php
adminSettingsPut($platform_settings): \OpenAPI\Client\Model\AdminSettingsPut200Response
```

Update platform settings (admin)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$platform_settings = new \OpenAPI\Client\Model\PlatformSettings(); // \OpenAPI\Client\Model\PlatformSettings

try {
    $result = $apiInstance->adminSettingsPut($platform_settings);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminSettingsPut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **platform_settings** | [**\OpenAPI\Client\Model\PlatformSettings**](../Model/PlatformSettings.md)|  | |

### Return type

[**\OpenAPI\Client\Model\AdminSettingsPut200Response**](../Model/AdminSettingsPut200Response.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminStatsGet()`

```php
adminStatsGet(): \OpenAPI\Client\Model\SystemStats
```

System-wide statistics (admin)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->adminStatsGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminStatsGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\SystemStats**](../Model/SystemStats.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminTestWebhookPost()`

```php
adminTestWebhookPost($admin_test_webhook_request): \OpenAPI\Client\Model\AdminTestWebhookResponse
```

Send a test webhook to a URL (admin)

Sends an HTTP POST to the specified URL with SSRF protection

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$admin_test_webhook_request = new \OpenAPI\Client\Model\AdminTestWebhookRequest(); // \OpenAPI\Client\Model\AdminTestWebhookRequest

try {
    $result = $apiInstance->adminTestWebhookPost($admin_test_webhook_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminTestWebhookPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **admin_test_webhook_request** | [**\OpenAPI\Client\Model\AdminTestWebhookRequest**](../Model/AdminTestWebhookRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\AdminTestWebhookResponse**](../Model/AdminTestWebhookResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminUsersExportGet()`

```php
adminUsersExportGet($format, $plan, $status): string
```

Export users as CSV (admin)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$format = 'csv'; // string
$plan = 'plan_example'; // string | Filter by plan
$status = 'status_example'; // string | Filter by status

try {
    $result = $apiInstance->adminUsersExportGet($format, $plan, $status);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminUsersExportGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **format** | **string**|  | [optional] [default to &#39;csv&#39;] |
| **plan** | **string**| Filter by plan | [optional] |
| **status** | **string**| Filter by status | [optional] |

### Return type

**string**

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/csv`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminUsersGet()`

```php
adminUsersGet($page, $per_page, $search, $plan, $status, $created_after, $created_before): \OpenAPI\Client\Model\PaginatedUsers
```

List all users (admin)

Returns paginated list of users with optional filters

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$page = 1; // int
$per_page = 20; // int
$search = 'search_example'; // string | Search by email or name (ILIKE)
$plan = 'plan_example'; // string | Filter by plan
$status = 'status_example'; // string | Filter by status
$created_after = new \DateTime('2013-10-20T19:20:30+01:00'); // \DateTime | Filter users created after this date (ISO 8601)
$created_before = new \DateTime('2013-10-20T19:20:30+01:00'); // \DateTime | Filter users created before this date (ISO 8601)

try {
    $result = $apiInstance->adminUsersGet($page, $per_page, $search, $plan, $status, $created_after, $created_before);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminUsersGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **page** | **int**|  | [optional] [default to 1] |
| **per_page** | **int**|  | [optional] [default to 20] |
| **search** | **string**| Search by email or name (ILIKE) | [optional] |
| **plan** | **string**| Filter by plan | [optional] |
| **status** | **string**| Filter by status | [optional] |
| **created_after** | **\DateTime**| Filter users created after this date (ISO 8601) | [optional] |
| **created_before** | **\DateTime**| Filter users created before this date (ISO 8601) | [optional] |

### Return type

[**\OpenAPI\Client\Model\PaginatedUsers**](../Model/PaginatedUsers.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminUsersIdAnalyticsGet()`

```php
adminUsersIdAnalyticsGet($id, $days): \OpenAPI\Client\Model\UserAnalytics
```

Get user analytics (admin)

Returns delivery analytics for a specific user over a time period

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$days = 30; // int | Number of days to analyze

try {
    $result = $apiInstance->adminUsersIdAnalyticsGet($id, $days);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminUsersIdAnalyticsGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **days** | **int**| Number of days to analyze | [optional] [default to 30] |

### Return type

[**\OpenAPI\Client\Model\UserAnalytics**](../Model/UserAnalytics.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminUsersIdGet()`

```php
adminUsersIdGet($id): \OpenAPI\Client\Model\AdminUsersIdGet200Response
```

Get user details (admin)

Returns user details with endpoints, recent deliveries, and usage stats

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $result = $apiInstance->adminUsersIdGet($id);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminUsersIdGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |

### Return type

[**\OpenAPI\Client\Model\AdminUsersIdGet200Response**](../Model/AdminUsersIdGet200Response.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminUsersIdPlanPut()`

```php
adminUsersIdPlanPut($id, $admin_users_id_plan_put_request)
```

Change user plan (admin)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$admin_users_id_plan_put_request = new \OpenAPI\Client\Model\AdminUsersIdPlanPutRequest(); // \OpenAPI\Client\Model\AdminUsersIdPlanPutRequest

try {
    $apiInstance->adminUsersIdPlanPut($id, $admin_users_id_plan_put_request);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminUsersIdPlanPut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **admin_users_id_plan_put_request** | [**\OpenAPI\Client\Model\AdminUsersIdPlanPutRequest**](../Model/AdminUsersIdPlanPutRequest.md)|  | |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `adminUsersIdStatusPut()`

```php
adminUsersIdStatusPut($id, $admin_users_id_status_put_request)
```

Change user status (admin)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AdminApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$admin_users_id_status_put_request = new \OpenAPI\Client\Model\AdminUsersIdStatusPutRequest(); // \OpenAPI\Client\Model\AdminUsersIdStatusPutRequest

try {
    $apiInstance->adminUsersIdStatusPut($id, $admin_users_id_status_put_request);
} catch (Exception $e) {
    echo 'Exception when calling AdminApi->adminUsersIdStatusPut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **admin_users_id_status_put_request** | [**\OpenAPI\Client\Model\AdminUsersIdStatusPutRequest**](../Model/AdminUsersIdStatusPutRequest.md)|  | |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
