# OpenAPI\Client\DevicesApi

Push notification device tokens

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**devicesGet()**](DevicesApi.md#devicesGet) | **GET** /devices | List registered devices |
| [**devicesPost()**](DevicesApi.md#devicesPost) | **POST** /devices | Register device for push notifications |
| [**devicesTokenDelete()**](DevicesApi.md#devicesTokenDelete) | **DELETE** /devices/{token} | Remove device token |


## `devicesGet()`

```php
devicesGet(): \OpenAPI\Client\Model\DeviceTokenResponse[]
```

List registered devices

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\DevicesApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->devicesGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling DevicesApi->devicesGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\DeviceTokenResponse[]**](../Model/DeviceTokenResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `devicesPost()`

```php
devicesPost($register_device_request): \OpenAPI\Client\Model\DeviceTokenResponse
```

Register device for push notifications

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\DevicesApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$register_device_request = new \OpenAPI\Client\Model\RegisterDeviceRequest(); // \OpenAPI\Client\Model\RegisterDeviceRequest

try {
    $result = $apiInstance->devicesPost($register_device_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling DevicesApi->devicesPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **register_device_request** | [**\OpenAPI\Client\Model\RegisterDeviceRequest**](../Model/RegisterDeviceRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\DeviceTokenResponse**](../Model/DeviceTokenResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `devicesTokenDelete()`

```php
devicesTokenDelete($token)
```

Remove device token

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\DevicesApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$token = 'token_example'; // string

try {
    $apiInstance->devicesTokenDelete($token);
} catch (Exception $e) {
    echo 'Exception when calling DevicesApi->devicesTokenDelete: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **token** | **string**|  | |

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
