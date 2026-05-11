# OpenAPI\Client\PlaygroundApi

Test webhooks in sandbox

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**playgroundGet()**](PlaygroundApi.md#playgroundGet) | **GET** /playground | Get playground info (endpoints, sample payloads) |
| [**playgroundTestPost()**](PlaygroundApi.md#playgroundTestPost) | **POST** /playground/test | Test a webhook delivery |


## `playgroundGet()`

```php
playgroundGet(): \OpenAPI\Client\Model\PlaygroundGet200Response
```

Get playground info (endpoints, sample payloads)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\PlaygroundApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->playgroundGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling PlaygroundApi->playgroundGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\PlaygroundGet200Response**](../Model/PlaygroundGet200Response.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `playgroundTestPost()`

```php
playgroundTestPost($test_webhook_request): \OpenAPI\Client\Model\TestWebhookResponse
```

Test a webhook delivery

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\PlaygroundApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$test_webhook_request = new \OpenAPI\Client\Model\TestWebhookRequest(); // \OpenAPI\Client\Model\TestWebhookRequest

try {
    $result = $apiInstance->playgroundTestPost($test_webhook_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling PlaygroundApi->playgroundTestPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **test_webhook_request** | [**\OpenAPI\Client\Model\TestWebhookRequest**](../Model/TestWebhookRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\TestWebhookResponse**](../Model/TestWebhookResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
