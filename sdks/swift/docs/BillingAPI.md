# BillingAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**billingInvoicesGet**](BillingAPI.md#billinginvoicesget) | **GET** /billing/invoices | List invoices
[**billingPortalPost**](BillingAPI.md#billingportalpost) | **POST** /billing/portal | Open customer billing portal
[**billingSubscriptionGet**](BillingAPI.md#billingsubscriptionget) | **GET** /billing/subscription | Get current subscription
[**billingUpgradePost**](BillingAPI.md#billingupgradepost) | **POST** /billing/upgrade | Upgrade plan
[**billingUsageGet**](BillingAPI.md#billingusageget) | **GET** /billing/usage | Get current usage
[**billingWebhookIyzicoPost**](BillingAPI.md#billingwebhookiyzicopost) | **POST** /billing/webhook/iyzico | iyzico webhook receiver
[**billingWebhookPolarPost**](BillingAPI.md#billingwebhookpolarpost) | **POST** /billing/webhook/polar | Polar.sh webhook receiver
[**billingWebhookPost**](BillingAPI.md#billingwebhookpost) | **POST** /billing/webhook | Stripe webhook receiver


# **billingInvoicesGet**
```swift
    open class func billingInvoicesGet(completion: @escaping (_ data: [InvoiceResponse]?, _ error: Error?) -> Void)
```

List invoices

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List invoices
BillingAPI.billingInvoicesGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**[InvoiceResponse]**](InvoiceResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billingPortalPost**
```swift
    open class func billingPortalPost(completion: @escaping (_ data: BillingPortalPost200Response?, _ error: Error?) -> Void)
```

Open customer billing portal

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Open customer billing portal
BillingAPI.billingPortalPost() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**BillingPortalPost200Response**](BillingPortalPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billingSubscriptionGet**
```swift
    open class func billingSubscriptionGet(completion: @escaping (_ data: SubscriptionResponse?, _ error: Error?) -> Void)
```

Get current subscription

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get current subscription
BillingAPI.billingSubscriptionGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**SubscriptionResponse**](SubscriptionResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billingUpgradePost**
```swift
    open class func billingUpgradePost(upgradeRequest: UpgradeRequest, completion: @escaping (_ data: UpgradeResponse?, _ error: Error?) -> Void)
```

Upgrade plan

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let upgradeRequest = UpgradeRequest(plan: "plan_example", provider: "provider_example") // UpgradeRequest | 

// Upgrade plan
BillingAPI.billingUpgradePost(upgradeRequest: upgradeRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **upgradeRequest** | [**UpgradeRequest**](UpgradeRequest.md) |  | 

### Return type

[**UpgradeResponse**](UpgradeResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billingUsageGet**
```swift
    open class func billingUsageGet(completion: @escaping (_ data: UsageResponse?, _ error: Error?) -> Void)
```

Get current usage

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get current usage
BillingAPI.billingUsageGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**UsageResponse**](UsageResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billingWebhookIyzicoPost**
```swift
    open class func billingWebhookIyzicoPost(body: AnyCodable, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

iyzico webhook receiver

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let body = "TODO" // AnyCodable | 

// iyzico webhook receiver
BillingAPI.billingWebhookIyzicoPost(body: body) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | **AnyCodable** |  | 

### Return type

Void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billingWebhookPolarPost**
```swift
    open class func billingWebhookPolarPost(body: AnyCodable, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Polar.sh webhook receiver

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let body = "TODO" // AnyCodable | 

// Polar.sh webhook receiver
BillingAPI.billingWebhookPolarPost(body: body) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | **AnyCodable** |  | 

### Return type

Void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billingWebhookPost**
```swift
    open class func billingWebhookPost(body: AnyCodable, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Stripe webhook receiver

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let body = "TODO" // AnyCodable | 

// Stripe webhook receiver
BillingAPI.billingWebhookPost(body: body) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | **AnyCodable** |  | 

### Return type

Void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

