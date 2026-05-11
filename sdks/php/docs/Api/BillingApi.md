# OpenAPI\Client\BillingApi

Subscription, usage, invoices, payment webhooks

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**billingInvoicesGet()**](BillingApi.md#billingInvoicesGet) | **GET** /billing/invoices | List invoices |
| [**billingPortalPost()**](BillingApi.md#billingPortalPost) | **POST** /billing/portal | Open customer billing portal |
| [**billingSubscriptionGet()**](BillingApi.md#billingSubscriptionGet) | **GET** /billing/subscription | Get current subscription |
| [**billingUpgradePost()**](BillingApi.md#billingUpgradePost) | **POST** /billing/upgrade | Upgrade plan |
| [**billingUsageGet()**](BillingApi.md#billingUsageGet) | **GET** /billing/usage | Get current usage |
| [**billingWebhookIyzicoPost()**](BillingApi.md#billingWebhookIyzicoPost) | **POST** /billing/webhook/iyzico | iyzico webhook receiver |
| [**billingWebhookPolarPost()**](BillingApi.md#billingWebhookPolarPost) | **POST** /billing/webhook/polar | Polar.sh webhook receiver |
| [**billingWebhookPost()**](BillingApi.md#billingWebhookPost) | **POST** /billing/webhook | Stripe webhook receiver |


## `billingInvoicesGet()`

```php
billingInvoicesGet(): \OpenAPI\Client\Model\InvoiceResponse[]
```

List invoices

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\BillingApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->billingInvoicesGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling BillingApi->billingInvoicesGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\InvoiceResponse[]**](../Model/InvoiceResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `billingPortalPost()`

```php
billingPortalPost(): \OpenAPI\Client\Model\BillingPortalPost200Response
```

Open customer billing portal

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\BillingApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->billingPortalPost();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling BillingApi->billingPortalPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\BillingPortalPost200Response**](../Model/BillingPortalPost200Response.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `billingSubscriptionGet()`

```php
billingSubscriptionGet(): \OpenAPI\Client\Model\SubscriptionResponse
```

Get current subscription

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\BillingApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->billingSubscriptionGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling BillingApi->billingSubscriptionGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\SubscriptionResponse**](../Model/SubscriptionResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `billingUpgradePost()`

```php
billingUpgradePost($upgrade_request): \OpenAPI\Client\Model\UpgradeResponse
```

Upgrade plan

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\BillingApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$upgrade_request = new \OpenAPI\Client\Model\UpgradeRequest(); // \OpenAPI\Client\Model\UpgradeRequest

try {
    $result = $apiInstance->billingUpgradePost($upgrade_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling BillingApi->billingUpgradePost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **upgrade_request** | [**\OpenAPI\Client\Model\UpgradeRequest**](../Model/UpgradeRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\UpgradeResponse**](../Model/UpgradeResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `billingUsageGet()`

```php
billingUsageGet(): \OpenAPI\Client\Model\UsageResponse
```

Get current usage

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\BillingApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->billingUsageGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling BillingApi->billingUsageGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\UsageResponse**](../Model/UsageResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `billingWebhookIyzicoPost()`

```php
billingWebhookIyzicoPost($body)
```

iyzico webhook receiver

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



$apiInstance = new OpenAPI\Client\Api\BillingApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);
$body = array('key' => new \stdClass); // object

try {
    $apiInstance->billingWebhookIyzicoPost($body);
} catch (Exception $e) {
    echo 'Exception when calling BillingApi->billingWebhookIyzicoPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **body** | **object**|  | |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `billingWebhookPolarPost()`

```php
billingWebhookPolarPost($body)
```

Polar.sh webhook receiver

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



$apiInstance = new OpenAPI\Client\Api\BillingApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);
$body = array('key' => new \stdClass); // object

try {
    $apiInstance->billingWebhookPolarPost($body);
} catch (Exception $e) {
    echo 'Exception when calling BillingApi->billingWebhookPolarPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **body** | **object**|  | |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `billingWebhookPost()`

```php
billingWebhookPost($body)
```

Stripe webhook receiver

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



$apiInstance = new OpenAPI\Client\Api\BillingApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);
$body = array('key' => new \stdClass); // object

try {
    $apiInstance->billingWebhookPost($body);
} catch (Exception $e) {
    echo 'Exception when calling BillingApi->billingWebhookPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **body** | **object**|  | |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
