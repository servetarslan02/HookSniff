# hooksniff.Api.AnalyticsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**AnalyticsDeliveriesGet**](AnalyticsApi.md#analyticsdeliveriesget) | **GET** /analytics/deliveries | Delivery trend over time |
| [**AnalyticsLatencyGet**](AnalyticsApi.md#analyticslatencyget) | **GET** /analytics/latency | Latency trend over time |
| [**AnalyticsSuccessRateGet**](AnalyticsApi.md#analyticssuccessrateget) | **GET** /analytics/success-rate | Success rate metrics |

<a id="analyticsdeliveriesget"></a>
# **AnalyticsDeliveriesGet**
> DeliveryTrendResponse AnalyticsDeliveriesGet (string range = null)

Delivery trend over time


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **range** | **string** |  | [optional] [default to 24h] |

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
| **200** | Delivery trend data |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="analyticslatencyget"></a>
# **AnalyticsLatencyGet**
> LatencyTrendResponse AnalyticsLatencyGet (string range = null)

Latency trend over time


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **range** | **string** |  | [optional] [default to 24h] |

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
| **200** | Latency trend data |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="analyticssuccessrateget"></a>
# **AnalyticsSuccessRateGet**
> SuccessRateResponse AnalyticsSuccessRateGet (string range = null)

Success rate metrics


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **range** | **string** |  | [optional] [default to 24h] |

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
| **200** | Success rate data |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

