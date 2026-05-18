# AnalyticsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**analyticsDeliveriesGet**](AnalyticsAPI.md#analyticsdeliveriesget) | **GET** /analytics/deliveries | Delivery trend over time
[**analyticsLatencyGet**](AnalyticsAPI.md#analyticslatencyget) | **GET** /analytics/latency | Latency trend over time
[**analyticsSuccessRateGet**](AnalyticsAPI.md#analyticssuccessrateget) | **GET** /analytics/success-rate | Success rate metrics


# **analyticsDeliveriesGet**
```swift
    open class func analyticsDeliveriesGet(range: ModelRange_analyticsDeliveriesGet? = nil, completion: @escaping (_ data: DeliveryTrendResponse?, _ error: Error?) -> Void)
```

Delivery trend over time

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let range = "range_example" // String |  (optional) (default to ._24h)

// Delivery trend over time
AnalyticsAPI.analyticsDeliveriesGet(range: range) { (response, error) in
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
 **range** | **String** |  | [optional] [default to ._24h]

### Return type

[**DeliveryTrendResponse**](DeliveryTrendResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analyticsLatencyGet**
```swift
    open class func analyticsLatencyGet(range: ModelRange_analyticsLatencyGet? = nil, completion: @escaping (_ data: LatencyTrendResponse?, _ error: Error?) -> Void)
```

Latency trend over time

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let range = "range_example" // String |  (optional) (default to ._24h)

// Latency trend over time
AnalyticsAPI.analyticsLatencyGet(range: range) { (response, error) in
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
 **range** | **String** |  | [optional] [default to ._24h]

### Return type

[**LatencyTrendResponse**](LatencyTrendResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analyticsSuccessRateGet**
```swift
    open class func analyticsSuccessRateGet(range: ModelRange_analyticsSuccessRateGet? = nil, completion: @escaping (_ data: SuccessRateResponse?, _ error: Error?) -> Void)
```

Success rate metrics

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let range = "range_example" // String |  (optional) (default to ._24h)

// Success rate metrics
AnalyticsAPI.analyticsSuccessRateGet(range: range) { (response, error) in
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
 **range** | **String** |  | [optional] [default to ._24h]

### Return type

[**SuccessRateResponse**](SuccessRateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

