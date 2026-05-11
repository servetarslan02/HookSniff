# OpenAPI\Client\TransformsApi

Payload transformation rules

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**endpointsEndpointIdTransformsGet()**](TransformsApi.md#endpointsEndpointIdTransformsGet) | **GET** /endpoints/{endpoint_id}/transforms | List transform rules for endpoint |
| [**endpointsEndpointIdTransformsIdDelete()**](TransformsApi.md#endpointsEndpointIdTransformsIdDelete) | **DELETE** /endpoints/{endpoint_id}/transforms/{id} | Delete transform rule |
| [**endpointsEndpointIdTransformsIdPut()**](TransformsApi.md#endpointsEndpointIdTransformsIdPut) | **PUT** /endpoints/{endpoint_id}/transforms/{id} | Update transform rule |
| [**endpointsEndpointIdTransformsPost()**](TransformsApi.md#endpointsEndpointIdTransformsPost) | **POST** /endpoints/{endpoint_id}/transforms | Create transform rule |
| [**endpointsEndpointIdTransformsTestPost()**](TransformsApi.md#endpointsEndpointIdTransformsTestPost) | **POST** /endpoints/{endpoint_id}/transforms/test | Test a transform rule |


## `endpointsEndpointIdTransformsGet()`

```php
endpointsEndpointIdTransformsGet($endpoint_id): \OpenAPI\Client\Model\TransformRule[]
```

List transform rules for endpoint

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TransformsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$endpoint_id = 'endpoint_id_example'; // string

try {
    $result = $apiInstance->endpointsEndpointIdTransformsGet($endpoint_id);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling TransformsApi->endpointsEndpointIdTransformsGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **endpoint_id** | **string**|  | |

### Return type

[**\OpenAPI\Client\Model\TransformRule[]**](../Model/TransformRule.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `endpointsEndpointIdTransformsIdDelete()`

```php
endpointsEndpointIdTransformsIdDelete($endpoint_id, $id)
```

Delete transform rule

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TransformsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$endpoint_id = 'endpoint_id_example'; // string
$id = 'id_example'; // string

try {
    $apiInstance->endpointsEndpointIdTransformsIdDelete($endpoint_id, $id);
} catch (Exception $e) {
    echo 'Exception when calling TransformsApi->endpointsEndpointIdTransformsIdDelete: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **endpoint_id** | **string**|  | |
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

## `endpointsEndpointIdTransformsIdPut()`

```php
endpointsEndpointIdTransformsIdPut($endpoint_id, $id, $body): \OpenAPI\Client\Model\TransformRule
```

Update transform rule

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TransformsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$endpoint_id = 'endpoint_id_example'; // string
$id = 'id_example'; // string
$body = array('key' => new \stdClass); // object

try {
    $result = $apiInstance->endpointsEndpointIdTransformsIdPut($endpoint_id, $id, $body);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling TransformsApi->endpointsEndpointIdTransformsIdPut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **endpoint_id** | **string**|  | |
| **id** | **string**|  | |
| **body** | **object**|  | |

### Return type

[**\OpenAPI\Client\Model\TransformRule**](../Model/TransformRule.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `endpointsEndpointIdTransformsPost()`

```php
endpointsEndpointIdTransformsPost($endpoint_id, $create_transform_rule_request): \OpenAPI\Client\Model\TransformRule
```

Create transform rule

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TransformsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$endpoint_id = 'endpoint_id_example'; // string
$create_transform_rule_request = new \OpenAPI\Client\Model\CreateTransformRuleRequest(); // \OpenAPI\Client\Model\CreateTransformRuleRequest

try {
    $result = $apiInstance->endpointsEndpointIdTransformsPost($endpoint_id, $create_transform_rule_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling TransformsApi->endpointsEndpointIdTransformsPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **endpoint_id** | **string**|  | |
| **create_transform_rule_request** | [**\OpenAPI\Client\Model\CreateTransformRuleRequest**](../Model/CreateTransformRuleRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\TransformRule**](../Model/TransformRule.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `endpointsEndpointIdTransformsTestPost()`

```php
endpointsEndpointIdTransformsTestPost($endpoint_id, $endpoints_endpoint_id_transforms_test_post_request)
```

Test a transform rule

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TransformsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$endpoint_id = 'endpoint_id_example'; // string
$endpoints_endpoint_id_transforms_test_post_request = new \OpenAPI\Client\Model\EndpointsEndpointIdTransformsTestPostRequest(); // \OpenAPI\Client\Model\EndpointsEndpointIdTransformsTestPostRequest

try {
    $apiInstance->endpointsEndpointIdTransformsTestPost($endpoint_id, $endpoints_endpoint_id_transforms_test_post_request);
} catch (Exception $e) {
    echo 'Exception when calling TransformsApi->endpointsEndpointIdTransformsTestPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **endpoint_id** | **string**|  | |
| **endpoints_endpoint_id_transforms_test_post_request** | [**\OpenAPI\Client\Model\EndpointsEndpointIdTransformsTestPostRequest**](../Model/EndpointsEndpointIdTransformsTestPostRequest.md)|  | |

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
