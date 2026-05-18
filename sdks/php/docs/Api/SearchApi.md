# OpenAPI\Client\SearchApi

Search webhook deliveries

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**searchGet()**](SearchApi.md#searchGet) | **GET** /search | Search deliveries |


## `searchGet()`

```php
searchGet($q, $status, $endpoint_id, $page, $per_page): \OpenAPI\Client\Model\SearchResult
```

Search deliveries

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\SearchApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$q = 'q_example'; // string
$status = 'status_example'; // string
$endpoint_id = 'endpoint_id_example'; // string
$page = 56; // int
$per_page = 56; // int

try {
    $result = $apiInstance->searchGet($q, $status, $endpoint_id, $page, $per_page);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling SearchApi->searchGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **q** | **string**|  | |
| **status** | **string**|  | [optional] |
| **endpoint_id** | **string**|  | [optional] |
| **page** | **int**|  | [optional] |
| **per_page** | **int**|  | [optional] |

### Return type

[**\OpenAPI\Client\Model\SearchResult**](../Model/SearchResult.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
