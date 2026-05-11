# hooksniff.Api.BillingApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**BillingInvoicesGet**](BillingApi.md#billinginvoicesget) | **GET** /billing/invoices | List invoices |
| [**BillingPortalPost**](BillingApi.md#billingportalpost) | **POST** /billing/portal | Open customer billing portal |
| [**BillingSubscriptionGet**](BillingApi.md#billingsubscriptionget) | **GET** /billing/subscription | Get current subscription |
| [**BillingUpgradePost**](BillingApi.md#billingupgradepost) | **POST** /billing/upgrade | Upgrade plan |
| [**BillingUsageGet**](BillingApi.md#billingusageget) | **GET** /billing/usage | Get current usage |
| [**BillingWebhookIyzicoPost**](BillingApi.md#billingwebhookiyzicopost) | **POST** /billing/webhook/iyzico | iyzico webhook receiver |
| [**BillingWebhookPolarPost**](BillingApi.md#billingwebhookpolarpost) | **POST** /billing/webhook/polar | Polar.sh webhook receiver |
| [**BillingWebhookPost**](BillingApi.md#billingwebhookpost) | **POST** /billing/webhook | Stripe webhook receiver |

<a id="billinginvoicesget"></a>
# **BillingInvoicesGet**
> List&lt;InvoiceResponse&gt; BillingInvoicesGet ()

List invoices


### Parameters
This endpoint does not need any parameter.
### Return type

[**List&lt;InvoiceResponse&gt;**](InvoiceResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Invoice list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="billingportalpost"></a>
# **BillingPortalPost**
> BillingPortalPost200Response BillingPortalPost ()

Open customer billing portal


### Parameters
This endpoint does not need any parameter.
### Return type

[**BillingPortalPost200Response**](BillingPortalPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Portal URL |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="billingsubscriptionget"></a>
# **BillingSubscriptionGet**
> SubscriptionResponse BillingSubscriptionGet ()

Get current subscription


### Parameters
This endpoint does not need any parameter.
### Return type

[**SubscriptionResponse**](SubscriptionResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Subscription details |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="billingupgradepost"></a>
# **BillingUpgradePost**
> UpgradeResponse BillingUpgradePost (UpgradeRequest upgradeRequest)

Upgrade plan


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **upgradeRequest** | [**UpgradeRequest**](UpgradeRequest.md) |  |  |

### Return type

[**UpgradeResponse**](UpgradeResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Checkout URL or direct upgrade |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="billingusageget"></a>
# **BillingUsageGet**
> UsageResponse BillingUsageGet ()

Get current usage


### Parameters
This endpoint does not need any parameter.
### Return type

[**UsageResponse**](UsageResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Usage data |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="billingwebhookiyzicopost"></a>
# **BillingWebhookIyzicoPost**
> void BillingWebhookIyzicoPost (Object body)

iyzico webhook receiver


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **body** | **Object** |  |  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Webhook processed |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="billingwebhookpolarpost"></a>
# **BillingWebhookPolarPost**
> void BillingWebhookPolarPost (Object body)

Polar.sh webhook receiver


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **body** | **Object** |  |  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Webhook processed |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="billingwebhookpost"></a>
# **BillingWebhookPost**
> void BillingWebhookPost (Object body)

Stripe webhook receiver


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **body** | **Object** |  |  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Webhook processed |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

