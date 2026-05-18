# OpenAPI\Client\EndpointsApi

Manage webhook destination endpoints

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**endpointsGet()**](EndpointsApi.md#endpointsGet) | **GET** /endpoints | List all endpoints |
| [**endpointsIdDelete()**](EndpointsApi.md#endpointsIdDelete) | **DELETE** /endpoints/{id} | Delete endpoint |
| [**endpointsIdGet()**](EndpointsApi.md#endpointsIdGet) | **GET** /endpoints/{id} | Get endpoint by ID |
| [**endpointsIdPut()**](EndpointsApi.md#endpointsIdPut) | **PUT** /endpoints/{id} | Update endpoint |
| [**endpointsIdRetryPolicyPut()**](EndpointsApi.md#endpointsIdRetryPolicyPut) | **PUT** /endpoints/{id}/retry-policy | Update retry policy for an endpoint |
| [**endpointsIdRotateSecretPost()**](EndpointsApi.md#endpointsIdRotateSecretPost) | **POST** /endpoints/{id}/rotate-secret | Rotate endpoint signing secret |
| [**endpointsPost()**](EndpointsApi.md#endpointsPost) | **POST** /endpoints | Create a new endpoint |


## `endpointsGet()`

```php
endpointsGet(): \OpenAPI\Client\Model\Endpoint[]
```

List all endpoints

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\EndpointsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->endpointsGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling EndpointsApi->endpointsGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\Endpoint[]**](../Model/Endpoint.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `endpointsIdDelete()`

```php
endpointsIdDelete($id)
```

Delete endpoint

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\EndpointsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $apiInstance->endpointsIdDelete($id);
} catch (Exception $e) {
    echo 'Exception when calling EndpointsApi->endpointsIdDelete: ', $e->getMessage(), PHP_EOL;
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

## `endpointsIdGet()`

```php
endpointsIdGet($id): \OpenAPI\Client\Model\Endpoint
```

Get endpoint by ID

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\EndpointsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $result = $apiInstance->endpointsIdGet($id);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling EndpointsApi->endpointsIdGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |

### Return type

[**\OpenAPI\Client\Model\Endpoint**](../Model/Endpoint.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `endpointsIdPut()`

```php
endpointsIdPut($id, $update_endpoint_request): \OpenAPI\Client\Model\Endpoint
```

Update endpoint

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\EndpointsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$update_endpoint_request = new \OpenAPI\Client\Model\UpdateEndpointRequest(); // \OpenAPI\Client\Model\UpdateEndpointRequest

try {
    $result = $apiInstance->endpointsIdPut($id, $update_endpoint_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling EndpointsApi->endpointsIdPut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **update_endpoint_request** | [**\OpenAPI\Client\Model\UpdateEndpointRequest**](../Model/UpdateEndpointRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\Endpoint**](../Model/Endpoint.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `endpointsIdRetryPolicyPut()`

```php
endpointsIdRetryPolicyPut($id, $retry_policy): \OpenAPI\Client\Model\Endpoint
```

Update retry policy for an endpoint

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\EndpointsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$retry_policy = new \OpenAPI\Client\Model\RetryPolicy(); // \OpenAPI\Client\Model\RetryPolicy

try {
    $result = $apiInstance->endpointsIdRetryPolicyPut($id, $retry_policy);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling EndpointsApi->endpointsIdRetryPolicyPut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **retry_policy** | [**\OpenAPI\Client\Model\RetryPolicy**](../Model/RetryPolicy.md)|  | |

### Return type

[**\OpenAPI\Client\Model\Endpoint**](../Model/Endpoint.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `endpointsIdRotateSecretPost()`

```php
endpointsIdRotateSecretPost($id): \OpenAPI\Client\Model\EndpointsIdRotateSecretPost200Response
```

Rotate endpoint signing secret

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\EndpointsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $result = $apiInstance->endpointsIdRotateSecretPost($id);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling EndpointsApi->endpointsIdRotateSecretPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |

### Return type

[**\OpenAPI\Client\Model\EndpointsIdRotateSecretPost200Response**](../Model/EndpointsIdRotateSecretPost200Response.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `endpointsPost()`

```php
endpointsPost($create_endpoint_request): \OpenAPI\Client\Model\Endpoint
```

Create a new endpoint

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\EndpointsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$create_endpoint_request = new \OpenAPI\Client\Model\CreateEndpointRequest(); // \OpenAPI\Client\Model\CreateEndpointRequest

try {
    $result = $apiInstance->endpointsPost($create_endpoint_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling EndpointsApi->endpointsPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **create_endpoint_request** | [**\OpenAPI\Client\Model\CreateEndpointRequest**](../Model/CreateEndpointRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\Endpoint**](../Model/Endpoint.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
