# OpenAPI\Client\AuthApi

Registration, login, password reset, email verification, 2FA

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**auth2faConfirmPost()**](AuthApi.md#auth2faConfirmPost) | **POST** /auth/2fa/confirm | Confirm 2FA setup with a code |
| [**auth2faDisablePost()**](AuthApi.md#auth2faDisablePost) | **POST** /auth/2fa/disable | Disable 2FA |
| [**auth2faEnablePost()**](AuthApi.md#auth2faEnablePost) | **POST** /auth/2fa/enable | Enable 2FA (returns TOTP secret and QR URL) |
| [**auth2faStatusGet()**](AuthApi.md#auth2faStatusGet) | **GET** /auth/2fa/status | Get 2FA status |
| [**auth2faVerifyPost()**](AuthApi.md#auth2faVerifyPost) | **POST** /auth/2fa/verify | Verify 2FA code during login |
| [**authAccountDelete()**](AuthApi.md#authAccountDelete) | **DELETE** /auth/account | Delete account (GDPR) |
| [**authConsentGet()**](AuthApi.md#authConsentGet) | **GET** /auth/consent | Get consent preferences |
| [**authConsentPost()**](AuthApi.md#authConsentPost) | **POST** /auth/consent | Update a consent preference |
| [**authExportGet()**](AuthApi.md#authExportGet) | **GET** /auth/export | Export user data (GDPR) |
| [**authForgotPasswordPost()**](AuthApi.md#authForgotPasswordPost) | **POST** /auth/forgot-password | Request password reset email |
| [**authLoginPost()**](AuthApi.md#authLoginPost) | **POST** /auth/login | Login with email and password |
| [**authLogoutPost()**](AuthApi.md#authLogoutPost) | **POST** /auth/logout | Logout (invalidate refresh token) |
| [**authMeGet()**](AuthApi.md#authMeGet) | **GET** /auth/me | Get current user profile |
| [**authPasswordPut()**](AuthApi.md#authPasswordPut) | **PUT** /auth/password | Change password |
| [**authProfilePut()**](AuthApi.md#authProfilePut) | **PUT** /auth/profile | Update profile |
| [**authRefreshPost()**](AuthApi.md#authRefreshPost) | **POST** /auth/refresh | Refresh access token |
| [**authRegisterPost()**](AuthApi.md#authRegisterPost) | **POST** /auth/register | Register a new account |
| [**authResendVerificationPost()**](AuthApi.md#authResendVerificationPost) | **POST** /auth/resend-verification | Resend verification email |
| [**authResetPasswordPost()**](AuthApi.md#authResetPasswordPost) | **POST** /auth/reset-password | Reset password with token |
| [**authVerifyEmailPost()**](AuthApi.md#authVerifyEmailPost) | **POST** /auth/verify-email | Verify email address |


## `auth2faConfirmPost()`

```php
auth2faConfirmPost($confirm2fa_request)
```

Confirm 2FA setup with a code

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$confirm2fa_request = new \OpenAPI\Client\Model\Confirm2faRequest(); // \OpenAPI\Client\Model\Confirm2faRequest

try {
    $apiInstance->auth2faConfirmPost($confirm2fa_request);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->auth2faConfirmPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **confirm2fa_request** | [**\OpenAPI\Client\Model\Confirm2faRequest**](../Model/Confirm2faRequest.md)|  | |

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

## `auth2faDisablePost()`

```php
auth2faDisablePost($disable2fa_request)
```

Disable 2FA

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$disable2fa_request = new \OpenAPI\Client\Model\Disable2faRequest(); // \OpenAPI\Client\Model\Disable2faRequest

try {
    $apiInstance->auth2faDisablePost($disable2fa_request);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->auth2faDisablePost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **disable2fa_request** | [**\OpenAPI\Client\Model\Disable2faRequest**](../Model/Disable2faRequest.md)|  | |

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

## `auth2faEnablePost()`

```php
auth2faEnablePost($enable2fa_request): \OpenAPI\Client\Model\Auth2faEnablePost200Response
```

Enable 2FA (returns TOTP secret and QR URL)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$enable2fa_request = new \OpenAPI\Client\Model\Enable2faRequest(); // \OpenAPI\Client\Model\Enable2faRequest

try {
    $result = $apiInstance->auth2faEnablePost($enable2fa_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->auth2faEnablePost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **enable2fa_request** | [**\OpenAPI\Client\Model\Enable2faRequest**](../Model/Enable2faRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\Auth2faEnablePost200Response**](../Model/Auth2faEnablePost200Response.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `auth2faStatusGet()`

```php
auth2faStatusGet(): \OpenAPI\Client\Model\Auth2faStatusGet200Response
```

Get 2FA status

Returns whether 2FA is enabled for the authenticated user

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->auth2faStatusGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->auth2faStatusGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\Auth2faStatusGet200Response**](../Model/Auth2faStatusGet200Response.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `auth2faVerifyPost()`

```php
auth2faVerifyPost($verify2fa_request): \OpenAPI\Client\Model\AuthResponse
```

Verify 2FA code during login

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);
$verify2fa_request = new \OpenAPI\Client\Model\Verify2faRequest(); // \OpenAPI\Client\Model\Verify2faRequest

try {
    $result = $apiInstance->auth2faVerifyPost($verify2fa_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->auth2faVerifyPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **verify2fa_request** | [**\OpenAPI\Client\Model\Verify2faRequest**](../Model/Verify2faRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\AuthResponse**](../Model/AuthResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `authAccountDelete()`

```php
authAccountDelete()
```

Delete account (GDPR)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $apiInstance->authAccountDelete();
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authAccountDelete: ', $e->getMessage(), PHP_EOL;
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

## `authConsentGet()`

```php
authConsentGet(): \OpenAPI\Client\Model\AuthConsentGet200Response
```

Get consent preferences

Returns the authenticated user's consent preferences

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->authConsentGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authConsentGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\AuthConsentGet200Response**](../Model/AuthConsentGet200Response.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `authConsentPost()`

```php
authConsentPost($auth_consent_post_request): \OpenAPI\Client\Model\AuthConsentPost200Response
```

Update a consent preference

Sets a single consent key to true/false

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$auth_consent_post_request = new \OpenAPI\Client\Model\AuthConsentPostRequest(); // \OpenAPI\Client\Model\AuthConsentPostRequest

try {
    $result = $apiInstance->authConsentPost($auth_consent_post_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authConsentPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **auth_consent_post_request** | [**\OpenAPI\Client\Model\AuthConsentPostRequest**](../Model/AuthConsentPostRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\AuthConsentPost200Response**](../Model/AuthConsentPost200Response.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `authExportGet()`

```php
authExportGet()
```

Export user data (GDPR)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $apiInstance->authExportGet();
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authExportGet: ', $e->getMessage(), PHP_EOL;
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

## `authForgotPasswordPost()`

```php
authForgotPasswordPost($forgot_password_request)
```

Request password reset email

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);
$forgot_password_request = new \OpenAPI\Client\Model\ForgotPasswordRequest(); // \OpenAPI\Client\Model\ForgotPasswordRequest

try {
    $apiInstance->authForgotPasswordPost($forgot_password_request);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authForgotPasswordPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **forgot_password_request** | [**\OpenAPI\Client\Model\ForgotPasswordRequest**](../Model/ForgotPasswordRequest.md)|  | |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `authLoginPost()`

```php
authLoginPost($login_request): \OpenAPI\Client\Model\AuthLoginPost200Response
```

Login with email and password

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);
$login_request = new \OpenAPI\Client\Model\LoginRequest(); // \OpenAPI\Client\Model\LoginRequest

try {
    $result = $apiInstance->authLoginPost($login_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authLoginPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **login_request** | [**\OpenAPI\Client\Model\LoginRequest**](../Model/LoginRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\AuthLoginPost200Response**](../Model/AuthLoginPost200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `authLogoutPost()`

```php
authLogoutPost()
```

Logout (invalidate refresh token)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $apiInstance->authLogoutPost();
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authLogoutPost: ', $e->getMessage(), PHP_EOL;
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

## `authMeGet()`

```php
authMeGet(): \OpenAPI\Client\Model\CustomerResponse
```

Get current user profile

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->authMeGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authMeGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\CustomerResponse**](../Model/CustomerResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `authPasswordPut()`

```php
authPasswordPut($change_password_request)
```

Change password

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$change_password_request = new \OpenAPI\Client\Model\ChangePasswordRequest(); // \OpenAPI\Client\Model\ChangePasswordRequest

try {
    $apiInstance->authPasswordPut($change_password_request);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authPasswordPut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **change_password_request** | [**\OpenAPI\Client\Model\ChangePasswordRequest**](../Model/ChangePasswordRequest.md)|  | |

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

## `authProfilePut()`

```php
authProfilePut($update_profile_request): \OpenAPI\Client\Model\CustomerResponse
```

Update profile

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$update_profile_request = new \OpenAPI\Client\Model\UpdateProfileRequest(); // \OpenAPI\Client\Model\UpdateProfileRequest

try {
    $result = $apiInstance->authProfilePut($update_profile_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authProfilePut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **update_profile_request** | [**\OpenAPI\Client\Model\UpdateProfileRequest**](../Model/UpdateProfileRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\CustomerResponse**](../Model/CustomerResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `authRefreshPost()`

```php
authRefreshPost($refresh_token_request): \OpenAPI\Client\Model\AuthResponse
```

Refresh access token

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);
$refresh_token_request = new \OpenAPI\Client\Model\RefreshTokenRequest(); // \OpenAPI\Client\Model\RefreshTokenRequest

try {
    $result = $apiInstance->authRefreshPost($refresh_token_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authRefreshPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **refresh_token_request** | [**\OpenAPI\Client\Model\RefreshTokenRequest**](../Model/RefreshTokenRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\AuthResponse**](../Model/AuthResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `authRegisterPost()`

```php
authRegisterPost($register_request): \OpenAPI\Client\Model\CustomerResponse
```

Register a new account

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);
$register_request = new \OpenAPI\Client\Model\RegisterRequest(); // \OpenAPI\Client\Model\RegisterRequest

try {
    $result = $apiInstance->authRegisterPost($register_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authRegisterPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **register_request** | [**\OpenAPI\Client\Model\RegisterRequest**](../Model/RegisterRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\CustomerResponse**](../Model/CustomerResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `authResendVerificationPost()`

```php
authResendVerificationPost($resend_verification_request)
```

Resend verification email

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);
$resend_verification_request = new \OpenAPI\Client\Model\ResendVerificationRequest(); // \OpenAPI\Client\Model\ResendVerificationRequest

try {
    $apiInstance->authResendVerificationPost($resend_verification_request);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authResendVerificationPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **resend_verification_request** | [**\OpenAPI\Client\Model\ResendVerificationRequest**](../Model/ResendVerificationRequest.md)|  | |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `authResetPasswordPost()`

```php
authResetPasswordPost($reset_password_request)
```

Reset password with token

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);
$reset_password_request = new \OpenAPI\Client\Model\ResetPasswordRequest(); // \OpenAPI\Client\Model\ResetPasswordRequest

try {
    $apiInstance->authResetPasswordPost($reset_password_request);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authResetPasswordPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **reset_password_request** | [**\OpenAPI\Client\Model\ResetPasswordRequest**](../Model/ResetPasswordRequest.md)|  | |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `authVerifyEmailPost()`

```php
authVerifyEmailPost($verify_email_request)
```

Verify email address

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



$apiInstance = new OpenAPI\Client\Api\AuthApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);
$verify_email_request = new \OpenAPI\Client\Model\VerifyEmailRequest(); // \OpenAPI\Client\Model\VerifyEmailRequest

try {
    $apiInstance->authVerifyEmailPost($verify_email_request);
} catch (Exception $e) {
    echo 'Exception when calling AuthApi->authVerifyEmailPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **verify_email_request** | [**\OpenAPI\Client\Model\VerifyEmailRequest**](../Model/VerifyEmailRequest.md)|  | |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
