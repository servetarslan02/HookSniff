# OpenAPI\Client\ApplicationsApi

Webhook payload templates

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**applicationsGet()**](ApplicationsApi.md#applicationsGet) | **GET** /applications | List applications |
| [**applicationsIdDelete()**](ApplicationsApi.md#applicationsIdDelete) | **DELETE** /applications/{id} | Delete application |
| [**applicationsIdGet()**](ApplicationsApi.md#applicationsIdGet) | **GET** /applications/{id} | Get application |
| [**applicationsIdPut()**](ApplicationsApi.md#applicationsIdPut) | **PUT** /applications/{id} | Update application |
| [**applicationsPost()**](ApplicationsApi.md#applicationsPost) | **POST** /applications | Create application |


## `applicationsGet()`

```php
applicationsGet(): \OpenAPI\Client\Model\Application[]
```

List applications

Returns all applications for the authenticated user

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\ApplicationsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->applicationsGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ApplicationsApi->applicationsGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\Application[]**](../Model/Application.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `applicationsIdDelete()`

```php
applicationsIdDelete($id)
```

Delete application

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\ApplicationsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $apiInstance->applicationsIdDelete($id);
} catch (Exception $e) {
    echo 'Exception when calling ApplicationsApi->applicationsIdDelete: ', $e->getMessage(), PHP_EOL;
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

## `applicationsIdGet()`

```php
applicationsIdGet($id): \OpenAPI\Client\Model\Application
```

Get application

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\ApplicationsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $result = $apiInstance->applicationsIdGet($id);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ApplicationsApi->applicationsIdGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |

### Return type

[**\OpenAPI\Client\Model\Application**](../Model/Application.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `applicationsIdPut()`

```php
applicationsIdPut($id, $applications_id_put_request): \OpenAPI\Client\Model\Application
```

Update application

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\ApplicationsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$applications_id_put_request = new \OpenAPI\Client\Model\ApplicationsIdPutRequest(); // \OpenAPI\Client\Model\ApplicationsIdPutRequest

try {
    $result = $apiInstance->applicationsIdPut($id, $applications_id_put_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ApplicationsApi->applicationsIdPut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **applications_id_put_request** | [**\OpenAPI\Client\Model\ApplicationsIdPutRequest**](../Model/ApplicationsIdPutRequest.md)|  | [optional] |

### Return type

[**\OpenAPI\Client\Model\Application**](../Model/Application.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `applicationsPost()`

```php
applicationsPost($applications_post_request): \OpenAPI\Client\Model\Application
```

Create application

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\ApplicationsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$applications_post_request = new \OpenAPI\Client\Model\ApplicationsPostRequest(); // \OpenAPI\Client\Model\ApplicationsPostRequest

try {
    $result = $apiInstance->applicationsPost($applications_post_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ApplicationsApi->applicationsPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **applications_post_request** | [**\OpenAPI\Client\Model\ApplicationsPostRequest**](../Model/ApplicationsPostRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\Application**](../Model/Application.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
