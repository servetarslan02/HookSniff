# OpenAPI\Client\InboundApi

Receive webhooks from external providers

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**inboundConfigsGet()**](InboundApi.md#inboundConfigsGet) | **GET** /inbound/configs | List inbound webhook configs |
| [**inboundConfigsIdDelete()**](InboundApi.md#inboundConfigsIdDelete) | **DELETE** /inbound/configs/{id} | Delete inbound config |
| [**inboundConfigsIdPut()**](InboundApi.md#inboundConfigsIdPut) | **PUT** /inbound/configs/{id} | Update inbound config |
| [**inboundConfigsPost()**](InboundApi.md#inboundConfigsPost) | **POST** /inbound/configs | Create inbound webhook config |
| [**inboundProviderEndpointIdPost()**](InboundApi.md#inboundProviderEndpointIdPost) | **POST** /inbound/{provider}/{endpoint_id} | Receive inbound webhook for a specific endpoint |
| [**inboundProviderPost()**](InboundApi.md#inboundProviderPost) | **POST** /inbound/{provider} | Receive inbound webhook from a provider |


## `inboundConfigsGet()`

```php
inboundConfigsGet(): \OpenAPI\Client\Model\InboundConfig[]
```

List inbound webhook configs

Returns all inbound webhook configurations for the authenticated user

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\InboundApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->inboundConfigsGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling InboundApi->inboundConfigsGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\InboundConfig[]**](../Model/InboundConfig.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `inboundConfigsIdDelete()`

```php
inboundConfigsIdDelete($id)
```

Delete inbound config

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\InboundApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $apiInstance->inboundConfigsIdDelete($id);
} catch (Exception $e) {
    echo 'Exception when calling InboundApi->inboundConfigsIdDelete: ', $e->getMessage(), PHP_EOL;
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

## `inboundConfigsIdPut()`

```php
inboundConfigsIdPut($id, $inbound_configs_id_put_request): \OpenAPI\Client\Model\InboundConfig
```

Update inbound config

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\InboundApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$inbound_configs_id_put_request = new \OpenAPI\Client\Model\InboundConfigsIdPutRequest(); // \OpenAPI\Client\Model\InboundConfigsIdPutRequest

try {
    $result = $apiInstance->inboundConfigsIdPut($id, $inbound_configs_id_put_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling InboundApi->inboundConfigsIdPut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **inbound_configs_id_put_request** | [**\OpenAPI\Client\Model\InboundConfigsIdPutRequest**](../Model/InboundConfigsIdPutRequest.md)|  | [optional] |

### Return type

[**\OpenAPI\Client\Model\InboundConfig**](../Model/InboundConfig.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `inboundConfigsPost()`

```php
inboundConfigsPost($inbound_configs_post_request): \OpenAPI\Client\Model\InboundConfig
```

Create inbound webhook config

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\InboundApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$inbound_configs_post_request = new \OpenAPI\Client\Model\InboundConfigsPostRequest(); // \OpenAPI\Client\Model\InboundConfigsPostRequest

try {
    $result = $apiInstance->inboundConfigsPost($inbound_configs_post_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling InboundApi->inboundConfigsPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **inbound_configs_post_request** | [**\OpenAPI\Client\Model\InboundConfigsPostRequest**](../Model/InboundConfigsPostRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\InboundConfig**](../Model/InboundConfig.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `inboundProviderEndpointIdPost()`

```php
inboundProviderEndpointIdPost($provider, $endpoint_id, $body)
```

Receive inbound webhook for a specific endpoint

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\InboundApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$provider = 'provider_example'; // string
$endpoint_id = 'endpoint_id_example'; // string
$body = array('key' => new \stdClass); // object

try {
    $apiInstance->inboundProviderEndpointIdPost($provider, $endpoint_id, $body);
} catch (Exception $e) {
    echo 'Exception when calling InboundApi->inboundProviderEndpointIdPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **provider** | **string**|  | |
| **endpoint_id** | **string**|  | |
| **body** | **object**|  | |

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

## `inboundProviderPost()`

```php
inboundProviderPost($provider, $body)
```

Receive inbound webhook from a provider

Accepts webhooks from external providers (Stripe, GitHub, etc.) and routes them to the customer's endpoints.

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\InboundApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$provider = 'provider_example'; // string
$body = array('key' => new \stdClass); // object

try {
    $apiInstance->inboundProviderPost($provider, $body);
} catch (Exception $e) {
    echo 'Exception when calling InboundApi->inboundProviderPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **provider** | **string**|  | |
| **body** | **object**|  | |

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
