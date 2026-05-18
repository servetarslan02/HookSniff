# hooksniff.BillingApi

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


# **billing_invoices_get**
> List[InvoiceResponse] billing_invoices_get()

List invoices

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.invoice_response import InvoiceResponse
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.BillingApi(api_client)

    try:
        # List invoices
        api_response = api_instance.billing_invoices_get()
        print("The response of BillingApi->billing_invoices_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling BillingApi->billing_invoices_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**List[InvoiceResponse]**](InvoiceResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Invoice list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billing_portal_post**
> BillingPortalPost200Response billing_portal_post()

Open customer billing portal

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.billing_portal_post200_response import BillingPortalPost200Response
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.BillingApi(api_client)

    try:
        # Open customer billing portal
        api_response = api_instance.billing_portal_post()
        print("The response of BillingApi->billing_portal_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling BillingApi->billing_portal_post: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Portal URL |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billing_subscription_get**
> SubscriptionResponse billing_subscription_get()

Get current subscription

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.subscription_response import SubscriptionResponse
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.BillingApi(api_client)

    try:
        # Get current subscription
        api_response = api_instance.billing_subscription_get()
        print("The response of BillingApi->billing_subscription_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling BillingApi->billing_subscription_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Subscription details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billing_upgrade_post**
> UpgradeResponse billing_upgrade_post(upgrade_request)

Upgrade plan

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.upgrade_request import UpgradeRequest
from hooksniff.models.upgrade_response import UpgradeResponse
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.BillingApi(api_client)
    upgrade_request = hooksniff.UpgradeRequest() # UpgradeRequest | 

    try:
        # Upgrade plan
        api_response = api_instance.billing_upgrade_post(upgrade_request)
        print("The response of BillingApi->billing_upgrade_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling BillingApi->billing_upgrade_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **upgrade_request** | [**UpgradeRequest**](UpgradeRequest.md)|  | 

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
**200** | Checkout URL or direct upgrade |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billing_usage_get**
> UsageResponse billing_usage_get()

Get current usage

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.usage_response import UsageResponse
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.BillingApi(api_client)

    try:
        # Get current usage
        api_response = api_instance.billing_usage_get()
        print("The response of BillingApi->billing_usage_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling BillingApi->billing_usage_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Usage data |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billing_webhook_iyzico_post**
> billing_webhook_iyzico_post(body)

iyzico webhook receiver

### Example


```python
import hooksniff
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)


# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.BillingApi(api_client)
    body = None # object | 

    try:
        # iyzico webhook receiver
        api_instance.billing_webhook_iyzico_post(body)
    except Exception as e:
        print("Exception when calling BillingApi->billing_webhook_iyzico_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | **object**|  | 

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
**200** | Webhook processed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billing_webhook_polar_post**
> billing_webhook_polar_post(body)

Polar.sh webhook receiver

### Example


```python
import hooksniff
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)


# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.BillingApi(api_client)
    body = None # object | 

    try:
        # Polar.sh webhook receiver
        api_instance.billing_webhook_polar_post(body)
    except Exception as e:
        print("Exception when calling BillingApi->billing_webhook_polar_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | **object**|  | 

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
**200** | Webhook processed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billing_webhook_post**
> billing_webhook_post(body)

Stripe webhook receiver

### Example


```python
import hooksniff
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)


# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.BillingApi(api_client)
    body = None # object | 

    try:
        # Stripe webhook receiver
        api_instance.billing_webhook_post(body)
    except Exception as e:
        print("Exception when calling BillingApi->billing_webhook_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | **object**|  | 

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
**200** | Webhook processed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

