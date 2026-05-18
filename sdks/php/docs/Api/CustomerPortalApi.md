# OpenAPI\Client\CustomerPortalApi



All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**portalApiKeysGet()**](CustomerPortalApi.md#portalApiKeysGet) | **GET** /portal/api-keys | List API keys (portal) |
| [**portalApiKeysKeyIdDelete()**](CustomerPortalApi.md#portalApiKeysKeyIdDelete) | **DELETE** /portal/api-keys/{key_id} | Revoke API key (portal) |
| [**portalApiKeysPost()**](CustomerPortalApi.md#portalApiKeysPost) | **POST** /portal/api-keys | Create API key (portal) |
| [**portalConfigGet()**](CustomerPortalApi.md#portalConfigGet) | **GET** /portal/config | Get portal configuration |
| [**portalConfigPost()**](CustomerPortalApi.md#portalConfigPost) | **POST** /portal/config | Update portal configuration |
| [**portalEmbedCodeGet()**](CustomerPortalApi.md#portalEmbedCodeGet) | **GET** /portal/embed-code | Get portal embed code |
| [**portalMeGet()**](CustomerPortalApi.md#portalMeGet) | **GET** /portal/me | Get portal profile |
| [**portalMePut()**](CustomerPortalApi.md#portalMePut) | **PUT** /portal/me | Update portal profile |
| [**portalNotificationsGet()**](CustomerPortalApi.md#portalNotificationsGet) | **GET** /portal/notifications | Get notification preferences (portal) |
| [**portalNotificationsPut()**](CustomerPortalApi.md#portalNotificationsPut) | **PUT** /portal/notifications | Update notification preferences (portal) |
| [**portalPlanGet()**](CustomerPortalApi.md#portalPlanGet) | **GET** /portal/plan | Get plan info (portal) |
| [**portalUsageGet()**](CustomerPortalApi.md#portalUsageGet) | **GET** /portal/usage | Get usage (portal) |


## `portalApiKeysGet()`

```php
portalApiKeysGet(): \OpenAPI\Client\Model\ApiKeyInfo[]
```

List API keys (portal)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\CustomerPortalApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->portalApiKeysGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling CustomerPortalApi->portalApiKeysGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\ApiKeyInfo[]**](../Model/ApiKeyInfo.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `portalApiKeysKeyIdDelete()`

```php
portalApiKeysKeyIdDelete($key_id)
```

Revoke API key (portal)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\CustomerPortalApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$key_id = 'key_id_example'; // string

try {
    $apiInstance->portalApiKeysKeyIdDelete($key_id);
} catch (Exception $e) {
    echo 'Exception when calling CustomerPortalApi->portalApiKeysKeyIdDelete: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **key_id** | **string**|  | |

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

## `portalApiKeysPost()`

```php
portalApiKeysPost(): \OpenAPI\Client\Model\CreateApiKeyResponse
```

Create API key (portal)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\CustomerPortalApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->portalApiKeysPost();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling CustomerPortalApi->portalApiKeysPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\CreateApiKeyResponse**](../Model/CreateApiKeyResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `portalConfigGet()`

```php
portalConfigGet()
```

Get portal configuration

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\CustomerPortalApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $apiInstance->portalConfigGet();
} catch (Exception $e) {
    echo 'Exception when calling CustomerPortalApi->portalConfigGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

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

## `portalConfigPost()`

```php
portalConfigPost()
```

Update portal configuration

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\CustomerPortalApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $apiInstance->portalConfigPost();
} catch (Exception $e) {
    echo 'Exception when calling CustomerPortalApi->portalConfigPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

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

## `portalEmbedCodeGet()`

```php
portalEmbedCodeGet()
```

Get portal embed code

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\CustomerPortalApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $apiInstance->portalEmbedCodeGet();
} catch (Exception $e) {
    echo 'Exception when calling CustomerPortalApi->portalEmbedCodeGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

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

## `portalMeGet()`

```php
portalMeGet(): \OpenAPI\Client\Model\PortalProfile
```

Get portal profile

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\CustomerPortalApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->portalMeGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling CustomerPortalApi->portalMeGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\PortalProfile**](../Model/PortalProfile.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `portalMePut()`

```php
portalMePut($update_profile_request)
```

Update portal profile

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\CustomerPortalApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$update_profile_request = new \OpenAPI\Client\Model\UpdateProfileRequest(); // \OpenAPI\Client\Model\UpdateProfileRequest

try {
    $apiInstance->portalMePut($update_profile_request);
} catch (Exception $e) {
    echo 'Exception when calling CustomerPortalApi->portalMePut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **update_profile_request** | [**\OpenAPI\Client\Model\UpdateProfileRequest**](../Model/UpdateProfileRequest.md)|  | |

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

## `portalNotificationsGet()`

```php
portalNotificationsGet(): \OpenAPI\Client\Model\NotificationPreferences
```

Get notification preferences (portal)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\CustomerPortalApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->portalNotificationsGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling CustomerPortalApi->portalNotificationsGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\NotificationPreferences**](../Model/NotificationPreferences.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `portalNotificationsPut()`

```php
portalNotificationsPut($update_notification_preferences): \OpenAPI\Client\Model\PortalNotificationsPut200Response
```

Update notification preferences (portal)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\CustomerPortalApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$update_notification_preferences = new \OpenAPI\Client\Model\UpdateNotificationPreferences(); // \OpenAPI\Client\Model\UpdateNotificationPreferences

try {
    $result = $apiInstance->portalNotificationsPut($update_notification_preferences);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling CustomerPortalApi->portalNotificationsPut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **update_notification_preferences** | [**\OpenAPI\Client\Model\UpdateNotificationPreferences**](../Model/UpdateNotificationPreferences.md)|  | |

### Return type

[**\OpenAPI\Client\Model\PortalNotificationsPut200Response**](../Model/PortalNotificationsPut200Response.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `portalPlanGet()`

```php
portalPlanGet(): \OpenAPI\Client\Model\SubscriptionResponse
```

Get plan info (portal)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\CustomerPortalApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->portalPlanGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling CustomerPortalApi->portalPlanGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\SubscriptionResponse**](../Model/SubscriptionResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `portalUsageGet()`

```php
portalUsageGet(): \OpenAPI\Client\Model\UsageResponse
```

Get usage (portal)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\CustomerPortalApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->portalUsageGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling CustomerPortalApi->portalUsageGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\UsageResponse**](../Model/UsageResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
