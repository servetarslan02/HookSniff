# OpenAPI\Client\SimulatorApi

Webhook simulator for testing

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**simulatorPost()**](SimulatorApi.md#simulatorPost) | **POST** /simulator | Simulate a webhook delivery |


## `simulatorPost()`

```php
simulatorPost($simulator_post_request)
```

Simulate a webhook delivery

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\SimulatorApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$simulator_post_request = new \OpenAPI\Client\Model\SimulatorPostRequest(); // \OpenAPI\Client\Model\SimulatorPostRequest

try {
    $apiInstance->simulatorPost($simulator_post_request);
} catch (Exception $e) {
    echo 'Exception when calling SimulatorApi->simulatorPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **simulator_post_request** | [**\OpenAPI\Client\Model\SimulatorPostRequest**](../Model/SimulatorPostRequest.md)|  | [optional] |

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
