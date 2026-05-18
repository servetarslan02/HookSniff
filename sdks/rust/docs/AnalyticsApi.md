# \AnalyticsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**analytics_deliveries_get**](AnalyticsApi.md#analytics_deliveries_get) | **GET** /analytics/deliveries | Delivery trend over time
[**analytics_latency_get**](AnalyticsApi.md#analytics_latency_get) | **GET** /analytics/latency | Latency trend over time
[**analytics_success_rate_get**](AnalyticsApi.md#analytics_success_rate_get) | **GET** /analytics/success-rate | Success rate metrics



## analytics_deliveries_get

> models::DeliveryTrendResponse analytics_deliveries_get(range)
Delivery trend over time

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**range** | Option<**String**> |  |  |[default to 24h]

### Return type

[**models::DeliveryTrendResponse**](DeliveryTrendResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## analytics_latency_get

> models::LatencyTrendResponse analytics_latency_get(range)
Latency trend over time

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**range** | Option<**String**> |  |  |[default to 24h]

### Return type

[**models::LatencyTrendResponse**](LatencyTrendResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## analytics_success_rate_get

> models::SuccessRateResponse analytics_success_rate_get(range)
Success rate metrics

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**range** | Option<**String**> |  |  |[default to 24h]

### Return type

[**models::SuccessRateResponse**](SuccessRateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

