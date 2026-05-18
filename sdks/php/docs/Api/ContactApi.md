# OpenAPI\Client\ContactApi

Contact form submission

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**contactPost()**](ContactApi.md#contactPost) | **POST** /contact | Send contact form message |


## `contactPost()`

```php
contactPost($contact_request): \OpenAPI\Client\Model\ContactResponse
```

Send contact form message

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



$apiInstance = new OpenAPI\Client\Api\ContactApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);
$contact_request = new \OpenAPI\Client\Model\ContactRequest(); // \OpenAPI\Client\Model\ContactRequest

try {
    $result = $apiInstance->contactPost($contact_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ContactApi->contactPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **contact_request** | [**\OpenAPI\Client\Model\ContactRequest**](../Model/ContactRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\ContactResponse**](../Model/ContactResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
