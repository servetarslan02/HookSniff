# OpenAPI\Client\OutboundIPsApi



All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**outboundIpsGet()**](OutboundIPsApi.md#outboundIpsGet) | **GET** /outbound-ips | Get outbound IP addresses for firewall whitelisting |


## `outboundIpsGet()`

```php
outboundIpsGet(): \OpenAPI\Client\Model\OutboundIpsResponse
```

Get outbound IP addresses for firewall whitelisting

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



$apiInstance = new OpenAPI\Client\Api\OutboundIPsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);

try {
    $result = $apiInstance->outboundIpsGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling OutboundIPsApi->outboundIpsGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\OutboundIpsResponse**](../Model/OutboundIpsResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
