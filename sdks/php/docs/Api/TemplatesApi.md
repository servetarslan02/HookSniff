# OpenAPI\Client\TemplatesApi

Webhook payload templates

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**templatesGet()**](TemplatesApi.md#templatesGet) | **GET** /templates | List available templates |
| [**templatesIdApplyPost()**](TemplatesApi.md#templatesIdApplyPost) | **POST** /templates/{id}/apply | Apply template to an endpoint |
| [**templatesIdGet()**](TemplatesApi.md#templatesIdGet) | **GET** /templates/{id} | Get template by ID |


## `templatesGet()`

```php
templatesGet($category): \OpenAPI\Client\Model\WebhookTemplate[]
```

List available templates

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TemplatesApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$category = 'category_example'; // string

try {
    $result = $apiInstance->templatesGet($category);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling TemplatesApi->templatesGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **category** | **string**|  | [optional] |

### Return type

[**\OpenAPI\Client\Model\WebhookTemplate[]**](../Model/WebhookTemplate.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `templatesIdApplyPost()`

```php
templatesIdApplyPost($id, $apply_template_request): \OpenAPI\Client\Model\ApplyTemplateResponse
```

Apply template to an endpoint

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TemplatesApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$apply_template_request = new \OpenAPI\Client\Model\ApplyTemplateRequest(); // \OpenAPI\Client\Model\ApplyTemplateRequest

try {
    $result = $apiInstance->templatesIdApplyPost($id, $apply_template_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling TemplatesApi->templatesIdApplyPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **apply_template_request** | [**\OpenAPI\Client\Model\ApplyTemplateRequest**](../Model/ApplyTemplateRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\ApplyTemplateResponse**](../Model/ApplyTemplateResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `templatesIdGet()`

```php
templatesIdGet($id): \OpenAPI\Client\Model\WebhookTemplate
```

Get template by ID

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TemplatesApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $result = $apiInstance->templatesIdGet($id);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling TemplatesApi->templatesIdGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |

### Return type

[**\OpenAPI\Client\Model\WebhookTemplate**](../Model/WebhookTemplate.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
