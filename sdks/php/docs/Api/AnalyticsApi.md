# OpenAPI\Client\AnalyticsApi

Delivery trends, success rates, latency metrics

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**analyticsDeliveriesGet()**](AnalyticsApi.md#analyticsDeliveriesGet) | **GET** /analytics/deliveries | Delivery trend over time |
| [**analyticsLatencyGet()**](AnalyticsApi.md#analyticsLatencyGet) | **GET** /analytics/latency | Latency trend over time |
| [**analyticsSuccessRateGet()**](AnalyticsApi.md#analyticsSuccessRateGet) | **GET** /analytics/success-rate | Success rate metrics |


## `analyticsDeliveriesGet()`

```php
analyticsDeliveriesGet($range): \OpenAPI\Client\Model\DeliveryTrendResponse
```

Delivery trend over time

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AnalyticsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$range = '24h'; // string

try {
    $result = $apiInstance->analyticsDeliveriesGet($range);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AnalyticsApi->analyticsDeliveriesGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **range** | **string**|  | [optional] [default to &#39;24h&#39;] |

### Return type

[**\OpenAPI\Client\Model\DeliveryTrendResponse**](../Model/DeliveryTrendResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `analyticsLatencyGet()`

```php
analyticsLatencyGet($range): \OpenAPI\Client\Model\LatencyTrendResponse
```

Latency trend over time

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AnalyticsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$range = '24h'; // string

try {
    $result = $apiInstance->analyticsLatencyGet($range);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AnalyticsApi->analyticsLatencyGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **range** | **string**|  | [optional] [default to &#39;24h&#39;] |

### Return type

[**\OpenAPI\Client\Model\LatencyTrendResponse**](../Model/LatencyTrendResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `analyticsSuccessRateGet()`

```php
analyticsSuccessRateGet($range): \OpenAPI\Client\Model\SuccessRateResponse
```

Success rate metrics

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\AnalyticsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$range = '24h'; // string

try {
    $result = $apiInstance->analyticsSuccessRateGet($range);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AnalyticsApi->analyticsSuccessRateGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **range** | **string**|  | [optional] [default to &#39;24h&#39;] |

### Return type

[**\OpenAPI\Client\Model\SuccessRateResponse**](../Model/SuccessRateResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
