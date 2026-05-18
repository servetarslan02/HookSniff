# OpenAPI\Client\RoutingApi

Smart routing configuration per endpoint

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**endpointsIdHealthGet()**](RoutingApi.md#endpointsIdHealthGet) | **GET** /endpoints/{id}/health | Get endpoint health status |
| [**endpointsIdRoutingGet()**](RoutingApi.md#endpointsIdRoutingGet) | **GET** /endpoints/{id}/routing | Get routing config for endpoint |
| [**endpointsIdRoutingPut()**](RoutingApi.md#endpointsIdRoutingPut) | **PUT** /endpoints/{id}/routing | Update routing config |


## `endpointsIdHealthGet()`

```php
endpointsIdHealthGet($id): \OpenAPI\Client\Model\EndpointHealth
```

Get endpoint health status

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\RoutingApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $result = $apiInstance->endpointsIdHealthGet($id);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling RoutingApi->endpointsIdHealthGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |

### Return type

[**\OpenAPI\Client\Model\EndpointHealth**](../Model/EndpointHealth.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `endpointsIdRoutingGet()`

```php
endpointsIdRoutingGet($id): \OpenAPI\Client\Model\RoutingInfo
```

Get routing config for endpoint

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\RoutingApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $result = $apiInstance->endpointsIdRoutingGet($id);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling RoutingApi->endpointsIdRoutingGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |

### Return type

[**\OpenAPI\Client\Model\RoutingInfo**](../Model/RoutingInfo.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `endpointsIdRoutingPut()`

```php
endpointsIdRoutingPut($id, $update_routing_request): \OpenAPI\Client\Model\RoutingInfo
```

Update routing config

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\RoutingApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$update_routing_request = new \OpenAPI\Client\Model\UpdateRoutingRequest(); // \OpenAPI\Client\Model\UpdateRoutingRequest

try {
    $result = $apiInstance->endpointsIdRoutingPut($id, $update_routing_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling RoutingApi->endpointsIdRoutingPut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **update_routing_request** | [**\OpenAPI\Client\Model\UpdateRoutingRequest**](../Model/UpdateRoutingRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\RoutingInfo**](../Model/RoutingInfo.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
