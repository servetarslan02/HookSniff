# OpenAPI\Client\OAuthApi

OAuth/SSO login providers

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**oauthGithubCallbackGet()**](OAuthApi.md#oauthGithubCallbackGet) | **GET** /oauth/github/callback | GitHub OAuth callback |
| [**oauthGithubGet()**](OAuthApi.md#oauthGithubGet) | **GET** /oauth/github | GitHub OAuth login redirect |
| [**oauthGoogleCallbackGet()**](OAuthApi.md#oauthGoogleCallbackGet) | **GET** /oauth/google/callback | Google OAuth callback |
| [**oauthGoogleGet()**](OAuthApi.md#oauthGoogleGet) | **GET** /oauth/google | Google OAuth login redirect |
| [**oauthProvidersGet()**](OAuthApi.md#oauthProvidersGet) | **GET** /oauth/providers | List available OAuth providers |


## `oauthGithubCallbackGet()`

```php
oauthGithubCallbackGet($code, $state, $error)
```

GitHub OAuth callback

Handles GitHub OAuth callback, creates/links account, sets auth cookies

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\OAuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$code = 'code_example'; // string | Authorization code from GitHub
$state = 'state_example'; // string | CSRF state token (verified against cookie)
$error = 'error_example'; // string | Error from GitHub (e.g. access_denied)

try {
    $apiInstance->oauthGithubCallbackGet($code, $state, $error);
} catch (Exception $e) {
    echo 'Exception when calling OAuthApi->oauthGithubCallbackGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **code** | **string**| Authorization code from GitHub | |
| **state** | **string**| CSRF state token (verified against cookie) | |
| **error** | **string**| Error from GitHub (e.g. access_denied) | [optional] |

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

## `oauthGithubGet()`

```php
oauthGithubGet()
```

GitHub OAuth login redirect

Redirects to GitHub OAuth consent screen with CSRF state cookie

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\OAuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $apiInstance->oauthGithubGet();
} catch (Exception $e) {
    echo 'Exception when calling OAuthApi->oauthGithubGet: ', $e->getMessage(), PHP_EOL;
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

## `oauthGoogleCallbackGet()`

```php
oauthGoogleCallbackGet()
```

Google OAuth callback

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\OAuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $apiInstance->oauthGoogleCallbackGet();
} catch (Exception $e) {
    echo 'Exception when calling OAuthApi->oauthGoogleCallbackGet: ', $e->getMessage(), PHP_EOL;
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

## `oauthGoogleGet()`

```php
oauthGoogleGet()
```

Google OAuth login redirect

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\OAuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $apiInstance->oauthGoogleGet();
} catch (Exception $e) {
    echo 'Exception when calling OAuthApi->oauthGoogleGet: ', $e->getMessage(), PHP_EOL;
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

## `oauthProvidersGet()`

```php
oauthProvidersGet()
```

List available OAuth providers

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\OAuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $apiInstance->oauthProvidersGet();
} catch (Exception $e) {
    echo 'Exception when calling OAuthApi->oauthProvidersGet: ', $e->getMessage(), PHP_EOL;
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
