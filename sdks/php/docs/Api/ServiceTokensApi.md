# OpenAPI\Client\ServiceTokensApi



All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**serviceTokensGet()**](ServiceTokensApi.md#serviceTokensGet) | **GET** /service-tokens | List service tokens |
| [**serviceTokensIdDelete()**](ServiceTokensApi.md#serviceTokensIdDelete) | **DELETE** /service-tokens/{id} | Delete service token |
| [**serviceTokensIdPut()**](ServiceTokensApi.md#serviceTokensIdPut) | **PUT** /service-tokens/{id} | Update service token |
| [**serviceTokensIdRevealPost()**](ServiceTokensApi.md#serviceTokensIdRevealPost) | **POST** /service-tokens/{id}/reveal | Reveal service token |
| [**serviceTokensPost()**](ServiceTokensApi.md#serviceTokensPost) | **POST** /service-tokens | Create a service token |


## `serviceTokensGet()`

```php
serviceTokensGet(): \OpenAPI\Client\Model\ServiceToken[]
```

List service tokens

Returns all service tokens for the authenticated user

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\ServiceTokensApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->serviceTokensGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ServiceTokensApi->serviceTokensGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\ServiceToken[]**](../Model/ServiceToken.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `serviceTokensIdDelete()`

```php
serviceTokensIdDelete($id)
```

Delete service token

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\ServiceTokensApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $apiInstance->serviceTokensIdDelete($id);
} catch (Exception $e) {
    echo 'Exception when calling ServiceTokensApi->serviceTokensIdDelete: ', $e->getMessage(), PHP_EOL;
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

## `serviceTokensIdPut()`

```php
serviceTokensIdPut($id, $service_tokens_id_put_request)
```

Update service token

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\ServiceTokensApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$service_tokens_id_put_request = new \OpenAPI\Client\Model\ServiceTokensIdPutRequest(); // \OpenAPI\Client\Model\ServiceTokensIdPutRequest

try {
    $apiInstance->serviceTokensIdPut($id, $service_tokens_id_put_request);
} catch (Exception $e) {
    echo 'Exception when calling ServiceTokensApi->serviceTokensIdPut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **service_tokens_id_put_request** | [**\OpenAPI\Client\Model\ServiceTokensIdPutRequest**](../Model/ServiceTokensIdPutRequest.md)|  | [optional] |

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

## `serviceTokensIdRevealPost()`

```php
serviceTokensIdRevealPost($id): \OpenAPI\Client\Model\ServiceTokensIdRevealPost200Response
```

Reveal service token

Returns the full token value (only available once after creation, or via this endpoint)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\ServiceTokensApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $result = $apiInstance->serviceTokensIdRevealPost($id);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ServiceTokensApi->serviceTokensIdRevealPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |

### Return type

[**\OpenAPI\Client\Model\ServiceTokensIdRevealPost200Response**](../Model/ServiceTokensIdRevealPost200Response.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `serviceTokensPost()`

```php
serviceTokensPost($service_tokens_post_request): \OpenAPI\Client\Model\ServiceTokenCreateResponse
```

Create a service token

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\ServiceTokensApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$service_tokens_post_request = new \OpenAPI\Client\Model\ServiceTokensPostRequest(); // \OpenAPI\Client\Model\ServiceTokensPostRequest

try {
    $result = $apiInstance->serviceTokensPost($service_tokens_post_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ServiceTokensApi->serviceTokensPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **service_tokens_post_request** | [**\OpenAPI\Client\Model\ServiceTokensPostRequest**](../Model/ServiceTokensPostRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\ServiceTokenCreateResponse**](../Model/ServiceTokenCreateResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
