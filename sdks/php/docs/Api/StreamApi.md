# OpenAPI\Client\StreamApi

Real-time delivery event stream (SSE)

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**streamDeliveriesGet()**](StreamApi.md#streamDeliveriesGet) | **GET** /stream/deliveries | Real-time delivery event stream (SSE) |


## `streamDeliveriesGet()`

```php
streamDeliveriesGet($endpoint_id, $status, $limit): string
```

Real-time delivery event stream (SSE)

Server-Sent Events stream of webhook deliveries

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\StreamApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$endpoint_id = 'endpoint_id_example'; // string
$status = 'status_example'; // string
$limit = 50; // int

try {
    $result = $apiInstance->streamDeliveriesGet($endpoint_id, $status, $limit);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling StreamApi->streamDeliveriesGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **endpoint_id** | **string**|  | [optional] |
| **status** | **string**|  | [optional] |
| **limit** | **int**|  | [optional] [default to 50] |

### Return type

**string**

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/event-stream`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
