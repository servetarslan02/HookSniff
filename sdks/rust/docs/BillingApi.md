# \BillingApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**billing_invoices_get**](BillingApi.md#billing_invoices_get) | **GET** /billing/invoices | List invoices
[**billing_portal_post**](BillingApi.md#billing_portal_post) | **POST** /billing/portal | Open customer billing portal
[**billing_subscription_get**](BillingApi.md#billing_subscription_get) | **GET** /billing/subscription | Get current subscription
[**billing_upgrade_post**](BillingApi.md#billing_upgrade_post) | **POST** /billing/upgrade | Upgrade plan
[**billing_usage_get**](BillingApi.md#billing_usage_get) | **GET** /billing/usage | Get current usage
[**billing_webhook_iyzico_post**](BillingApi.md#billing_webhook_iyzico_post) | **POST** /billing/webhook/iyzico | iyzico webhook receiver
[**billing_webhook_polar_post**](BillingApi.md#billing_webhook_polar_post) | **POST** /billing/webhook/polar | Polar.sh webhook receiver
[**billing_webhook_post**](BillingApi.md#billing_webhook_post) | **POST** /billing/webhook | Stripe webhook receiver



## billing_invoices_get

> Vec<models::InvoiceResponse> billing_invoices_get()
List invoices

### Parameters

This endpoint does not need any parameter.

### Return type

[**Vec<models::InvoiceResponse>**](InvoiceResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## billing_portal_post

> models::BillingPortalPost200Response billing_portal_post()
Open customer billing portal

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::BillingPortalPost200Response**](_billing_portal_post_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## billing_subscription_get

> models::SubscriptionResponse billing_subscription_get()
Get current subscription

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::SubscriptionResponse**](SubscriptionResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## billing_upgrade_post

> models::UpgradeResponse billing_upgrade_post(upgrade_request)
Upgrade plan

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**upgrade_request** | [**UpgradeRequest**](UpgradeRequest.md) |  | [required] |

### Return type

[**models::UpgradeResponse**](UpgradeResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## billing_usage_get

> models::UsageResponse billing_usage_get()
Get current usage

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::UsageResponse**](UsageResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## billing_webhook_iyzico_post

> billing_webhook_iyzico_post(body)
iyzico webhook receiver

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**body** | **serde_json::Value** |  | [required] |

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## billing_webhook_polar_post

> billing_webhook_polar_post(body)
Polar.sh webhook receiver

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**body** | **serde_json::Value** |  | [required] |

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## billing_webhook_post

> billing_webhook_post(body)
Stripe webhook receiver

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**body** | **serde_json::Value** |  | [required] |

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

