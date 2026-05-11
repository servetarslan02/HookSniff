# \AnalyticsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**AnalyticsDeliveriesGet**](AnalyticsAPI.md#AnalyticsDeliveriesGet) | **Get** /analytics/deliveries | Delivery trend over time
[**AnalyticsLatencyGet**](AnalyticsAPI.md#AnalyticsLatencyGet) | **Get** /analytics/latency | Latency trend over time
[**AnalyticsSuccessRateGet**](AnalyticsAPI.md#AnalyticsSuccessRateGet) | **Get** /analytics/success-rate | Success rate metrics



## AnalyticsDeliveriesGet

> DeliveryTrendResponse AnalyticsDeliveriesGet(ctx).Range_(range_).Execute()

Delivery trend over time

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	range_ := "range__example" // string |  (optional) (default to "24h")

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AnalyticsAPI.AnalyticsDeliveriesGet(context.Background()).Range_(range_).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AnalyticsAPI.AnalyticsDeliveriesGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AnalyticsDeliveriesGet`: DeliveryTrendResponse
	fmt.Fprintf(os.Stdout, "Response from `AnalyticsAPI.AnalyticsDeliveriesGet`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAnalyticsDeliveriesGetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **range_** | **string** |  | [default to &quot;24h&quot;]

### Return type

[**DeliveryTrendResponse**](DeliveryTrendResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AnalyticsLatencyGet

> LatencyTrendResponse AnalyticsLatencyGet(ctx).Range_(range_).Execute()

Latency trend over time

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	range_ := "range__example" // string |  (optional) (default to "24h")

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AnalyticsAPI.AnalyticsLatencyGet(context.Background()).Range_(range_).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AnalyticsAPI.AnalyticsLatencyGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AnalyticsLatencyGet`: LatencyTrendResponse
	fmt.Fprintf(os.Stdout, "Response from `AnalyticsAPI.AnalyticsLatencyGet`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAnalyticsLatencyGetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **range_** | **string** |  | [default to &quot;24h&quot;]

### Return type

[**LatencyTrendResponse**](LatencyTrendResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AnalyticsSuccessRateGet

> SuccessRateResponse AnalyticsSuccessRateGet(ctx).Range_(range_).Execute()

Success rate metrics

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	range_ := "range__example" // string |  (optional) (default to "24h")

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AnalyticsAPI.AnalyticsSuccessRateGet(context.Background()).Range_(range_).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AnalyticsAPI.AnalyticsSuccessRateGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AnalyticsSuccessRateGet`: SuccessRateResponse
	fmt.Fprintf(os.Stdout, "Response from `AnalyticsAPI.AnalyticsSuccessRateGet`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAnalyticsSuccessRateGetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **range_** | **string** |  | [default to &quot;24h&quot;]

### Return type

[**SuccessRateResponse**](SuccessRateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

