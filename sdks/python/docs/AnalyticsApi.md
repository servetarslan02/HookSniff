# hooksniff.AnalyticsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**analytics_deliveries_get**](AnalyticsApi.md#analytics_deliveries_get) | **GET** /analytics/deliveries | Delivery trend over time
[**analytics_latency_get**](AnalyticsApi.md#analytics_latency_get) | **GET** /analytics/latency | Latency trend over time
[**analytics_success_rate_get**](AnalyticsApi.md#analytics_success_rate_get) | **GET** /analytics/success-rate | Success rate metrics


# **analytics_deliveries_get**
> DeliveryTrendResponse analytics_deliveries_get(range=range)

Delivery trend over time

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.delivery_trend_response import DeliveryTrendResponse
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
    api_instance = hooksniff.AnalyticsApi(api_client)
    range = 24h # str |  (optional) (default to 24h)

    try:
        # Delivery trend over time
        api_response = api_instance.analytics_deliveries_get(range=range)
        print("The response of AnalyticsApi->analytics_deliveries_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AnalyticsApi->analytics_deliveries_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **range** | **str**|  | [optional] [default to 24h]

### Return type

[**DeliveryTrendResponse**](DeliveryTrendResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Delivery trend data |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analytics_latency_get**
> LatencyTrendResponse analytics_latency_get(range=range)

Latency trend over time

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.latency_trend_response import LatencyTrendResponse
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
    api_instance = hooksniff.AnalyticsApi(api_client)
    range = 24h # str |  (optional) (default to 24h)

    try:
        # Latency trend over time
        api_response = api_instance.analytics_latency_get(range=range)
        print("The response of AnalyticsApi->analytics_latency_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AnalyticsApi->analytics_latency_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **range** | **str**|  | [optional] [default to 24h]

### Return type

[**LatencyTrendResponse**](LatencyTrendResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Latency trend data |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analytics_success_rate_get**
> SuccessRateResponse analytics_success_rate_get(range=range)

Success rate metrics

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.success_rate_response import SuccessRateResponse
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
    api_instance = hooksniff.AnalyticsApi(api_client)
    range = 24h # str |  (optional) (default to 24h)

    try:
        # Success rate metrics
        api_response = api_instance.analytics_success_rate_get(range=range)
        print("The response of AnalyticsApi->analytics_success_rate_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AnalyticsApi->analytics_success_rate_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **range** | **str**|  | [optional] [default to 24h]

### Return type

[**SuccessRateResponse**](SuccessRateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success rate data |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

