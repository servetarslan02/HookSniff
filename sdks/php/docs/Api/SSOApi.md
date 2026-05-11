# OpenAPI\Client\SSOApi

Single Sign-On configuration (SAML/OIDC)

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**ssoConfigDelete()**](SSOApi.md#ssoConfigDelete) | **DELETE** /sso/config | Delete SSO configuration |
| [**ssoConfigGet()**](SSOApi.md#ssoConfigGet) | **GET** /sso/config | Get SSO configuration |
| [**ssoConfigPost()**](SSOApi.md#ssoConfigPost) | **POST** /sso/config | Create/update SSO configuration |
| [**ssoTestPost()**](SSOApi.md#ssoTestPost) | **POST** /sso/test | Test SSO connection |


## `ssoConfigDelete()`

```php
ssoConfigDelete()
```

Delete SSO configuration

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\SSOApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $apiInstance->ssoConfigDelete();
} catch (Exception $e) {
    echo 'Exception when calling SSOApi->ssoConfigDelete: ', $e->getMessage(), PHP_EOL;
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

## `ssoConfigGet()`

```php
ssoConfigGet()
```

Get SSO configuration

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\SSOApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $apiInstance->ssoConfigGet();
} catch (Exception $e) {
    echo 'Exception when calling SSOApi->ssoConfigGet: ', $e->getMessage(), PHP_EOL;
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

## `ssoConfigPost()`

```php
ssoConfigPost($sso_config_post_request)
```

Create/update SSO configuration

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\SSOApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$sso_config_post_request = new \OpenAPI\Client\Model\SsoConfigPostRequest(); // \OpenAPI\Client\Model\SsoConfigPostRequest

try {
    $apiInstance->ssoConfigPost($sso_config_post_request);
} catch (Exception $e) {
    echo 'Exception when calling SSOApi->ssoConfigPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **sso_config_post_request** | [**\OpenAPI\Client\Model\SsoConfigPostRequest**](../Model/SsoConfigPostRequest.md)|  | [optional] |

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

## `ssoTestPost()`

```php
ssoTestPost()
```

Test SSO connection

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\SSOApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $apiInstance->ssoTestPost();
} catch (Exception $e) {
    echo 'Exception when calling SSOApi->ssoTestPost: ', $e->getMessage(), PHP_EOL;
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
