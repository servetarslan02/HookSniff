# OpenAPI\Client\SchemasApi

JSON Schema registry and validation

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**schemasGet()**](SchemasApi.md#schemasGet) | **GET** /schemas | List registered schemas |
| [**schemasIdGet()**](SchemasApi.md#schemasIdGet) | **GET** /schemas/{id} | Get schema by ID |
| [**schemasIdValidatePost()**](SchemasApi.md#schemasIdValidatePost) | **POST** /schemas/{id}/validate | Validate an event against a schema |
| [**schemasPost()**](SchemasApi.md#schemasPost) | **POST** /schemas | Register a new JSON Schema |


## `schemasGet()`

```php
schemasGet()
```

List registered schemas

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\SchemasApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $apiInstance->schemasGet();
} catch (Exception $e) {
    echo 'Exception when calling SchemasApi->schemasGet: ', $e->getMessage(), PHP_EOL;
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

## `schemasIdGet()`

```php
schemasIdGet($id)
```

Get schema by ID

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\SchemasApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $apiInstance->schemasIdGet($id);
} catch (Exception $e) {
    echo 'Exception when calling SchemasApi->schemasIdGet: ', $e->getMessage(), PHP_EOL;
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

## `schemasIdValidatePost()`

```php
schemasIdValidatePost($id, $validate_event_request)
```

Validate an event against a schema

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\SchemasApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$validate_event_request = new \OpenAPI\Client\Model\ValidateEventRequest(); // \OpenAPI\Client\Model\ValidateEventRequest

try {
    $apiInstance->schemasIdValidatePost($id, $validate_event_request);
} catch (Exception $e) {
    echo 'Exception when calling SchemasApi->schemasIdValidatePost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **validate_event_request** | [**\OpenAPI\Client\Model\ValidateEventRequest**](../Model/ValidateEventRequest.md)|  | |

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

## `schemasPost()`

```php
schemasPost($register_schema_request)
```

Register a new JSON Schema

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\SchemasApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$register_schema_request = new \OpenAPI\Client\Model\RegisterSchemaRequest(); // \OpenAPI\Client\Model\RegisterSchemaRequest

try {
    $apiInstance->schemasPost($register_schema_request);
} catch (Exception $e) {
    echo 'Exception when calling SchemasApi->schemasPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **register_schema_request** | [**\OpenAPI\Client\Model\RegisterSchemaRequest**](../Model/RegisterSchemaRequest.md)|  | |

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
