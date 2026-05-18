# \AdminAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**AdminAlertsGet**](AdminAPI.md#AdminAlertsGet) | **Get** /admin/alerts | List all alert rules (admin)
[**AdminAlertsIdDelete**](AdminAPI.md#AdminAlertsIdDelete) | **Delete** /admin/alerts/{id} | Delete an alert rule (admin)
[**AdminAlertsIdPut**](AdminAPI.md#AdminAlertsIdPut) | **Put** /admin/alerts/{id} | Update an alert rule (admin)
[**AdminAlertsPost**](AdminAPI.md#AdminAlertsPost) | **Post** /admin/alerts | Create a platform alert rule (admin)
[**AdminAuditLogsGet**](AdminAPI.md#AdminAuditLogsGet) | **Get** /admin/audit-logs | List audit logs (admin)
[**AdminChurnGet**](AdminAPI.md#AdminChurnGet) | **Get** /admin/churn | Get churn metrics (admin)
[**AdminDeliveriesIdReplayPost**](AdminAPI.md#AdminDeliveriesIdReplayPost) | **Post** /admin/deliveries/{id}/replay | Replay a delivery (admin)
[**AdminDeployInfoGet**](AdminAPI.md#AdminDeployInfoGet) | **Get** /admin/deploy-info | Get deploy info
[**AdminFeatureFlagsGet**](AdminAPI.md#AdminFeatureFlagsGet) | **Get** /admin/feature-flags | List feature flags
[**AdminFeatureFlagsIdDelete**](AdminAPI.md#AdminFeatureFlagsIdDelete) | **Delete** /admin/feature-flags/{id} | Delete feature flag
[**AdminFeatureFlagsIdPut**](AdminAPI.md#AdminFeatureFlagsIdPut) | **Put** /admin/feature-flags/{id} | Update feature flag
[**AdminFeatureFlagsPost**](AdminAPI.md#AdminFeatureFlagsPost) | **Post** /admin/feature-flags | Create feature flag
[**AdminRevenueExportGet**](AdminAPI.md#AdminRevenueExportGet) | **Get** /admin/revenue/export | Export revenue data as CSV (admin)
[**AdminRevenueGet**](AdminAPI.md#AdminRevenueGet) | **Get** /admin/revenue | Revenue analytics (admin)
[**AdminSdkUpdatePost**](AdminAPI.md#AdminSdkUpdatePost) | **Post** /admin/sdk-update | Send SDK update notification to users
[**AdminSettingsGet**](AdminAPI.md#AdminSettingsGet) | **Get** /admin/settings | Get platform settings (admin)
[**AdminSettingsPut**](AdminAPI.md#AdminSettingsPut) | **Put** /admin/settings | Update platform settings (admin)
[**AdminStatsGet**](AdminAPI.md#AdminStatsGet) | **Get** /admin/stats | System-wide statistics (admin)
[**AdminTestWebhookPost**](AdminAPI.md#AdminTestWebhookPost) | **Post** /admin/test-webhook | Send a test webhook to a URL (admin)
[**AdminUsersExportGet**](AdminAPI.md#AdminUsersExportGet) | **Get** /admin/users/export | Export users as CSV (admin)
[**AdminUsersGet**](AdminAPI.md#AdminUsersGet) | **Get** /admin/users | List all users (admin)
[**AdminUsersIdAnalyticsGet**](AdminAPI.md#AdminUsersIdAnalyticsGet) | **Get** /admin/users/{id}/analytics | Get user analytics (admin)
[**AdminUsersIdGet**](AdminAPI.md#AdminUsersIdGet) | **Get** /admin/users/{id} | Get user details (admin)
[**AdminUsersIdPlanPut**](AdminAPI.md#AdminUsersIdPlanPut) | **Put** /admin/users/{id}/plan | Change user plan (admin)
[**AdminUsersIdStatusPut**](AdminAPI.md#AdminUsersIdStatusPut) | **Put** /admin/users/{id}/status | Change user status (admin)



## AdminAlertsGet

> []AdminAlertRule AdminAlertsGet(ctx).Execute()

List all alert rules (admin)



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

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminAlertsGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminAlertsGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminAlertsGet`: []AdminAlertRule
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminAlertsGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiAdminAlertsGetRequest struct via the builder pattern


### Return type

[**[]AdminAlertRule**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminAlertsIdDelete

> AdminAlertsIdDelete200Response AdminAlertsIdDelete(ctx, id).Execute()

Delete an alert rule (admin)

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
	id := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminAlertsIdDelete(context.Background(), id).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminAlertsIdDelete``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminAlertsIdDelete`: AdminAlertsIdDelete200Response
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminAlertsIdDelete`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiAdminAlertsIdDeleteRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**AdminAlertsIdDelete200Response**](AdminAlertsIdDelete200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminAlertsIdPut

> AdminAlertRule AdminAlertsIdPut(ctx, id).AdminUpdateAlertRequest(adminUpdateAlertRequest).Execute()

Update an alert rule (admin)

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
	id := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 
	adminUpdateAlertRequest := *openapiclient.NewAdminUpdateAlertRequest() // AdminUpdateAlertRequest |  (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminAlertsIdPut(context.Background(), id).AdminUpdateAlertRequest(adminUpdateAlertRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminAlertsIdPut``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminAlertsIdPut`: AdminAlertRule
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminAlertsIdPut`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiAdminAlertsIdPutRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **adminUpdateAlertRequest** | [**AdminUpdateAlertRequest**](AdminUpdateAlertRequest.md) |  | 

### Return type

[**AdminAlertRule**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminAlertsPost

> AdminAlertRule AdminAlertsPost(ctx).AdminCreateAlertRequest(adminCreateAlertRequest).Execute()

Create a platform alert rule (admin)

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
	adminCreateAlertRequest := *openapiclient.NewAdminCreateAlertRequest("Name_example", "Condition_example", int32(123), []string{"Channels_example"}) // AdminCreateAlertRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminAlertsPost(context.Background()).AdminCreateAlertRequest(adminCreateAlertRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminAlertsPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminAlertsPost`: AdminAlertRule
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminAlertsPost`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAdminAlertsPostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **adminCreateAlertRequest** | [**AdminCreateAlertRequest**](AdminCreateAlertRequest.md) |  | 

### Return type

[**AdminAlertRule**](AdminAlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminAuditLogsGet

> AdminAuditLogResponse AdminAuditLogsGet(ctx).Page(page).PerPage(perPage).Action(action).AdminId(adminId).Execute()

List audit logs (admin)



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
	page := int32(56) // int32 |  (optional) (default to 1)
	perPage := int32(56) // int32 |  (optional) (default to 50)
	action := "action_example" // string |  (optional)
	adminId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string |  (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminAuditLogsGet(context.Background()).Page(page).PerPage(perPage).Action(action).AdminId(adminId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminAuditLogsGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminAuditLogsGet`: AdminAuditLogResponse
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminAuditLogsGet`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAdminAuditLogsGetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **int32** |  | [default to 1]
 **perPage** | **int32** |  | [default to 50]
 **action** | **string** |  | 
 **adminId** | **string** |  | 

### Return type

[**AdminAuditLogResponse**](AdminAuditLogResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminChurnGet

> ChurnResponse AdminChurnGet(ctx).Execute()

Get churn metrics (admin)



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

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminChurnGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminChurnGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminChurnGet`: ChurnResponse
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminChurnGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiAdminChurnGetRequest struct via the builder pattern


### Return type

[**ChurnResponse**](ChurnResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminDeliveriesIdReplayPost

> ReplayDeliveryResponse AdminDeliveriesIdReplayPost(ctx, id).Execute()

Replay a delivery (admin)



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
	id := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | Original delivery ID to replay

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminDeliveriesIdReplayPost(context.Background(), id).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminDeliveriesIdReplayPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminDeliveriesIdReplayPost`: ReplayDeliveryResponse
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminDeliveriesIdReplayPost`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** | Original delivery ID to replay | 

### Other Parameters

Other parameters are passed through a pointer to a apiAdminDeliveriesIdReplayPostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**ReplayDeliveryResponse**](ReplayDeliveryResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminDeployInfoGet

> DeployInfo AdminDeployInfoGet(ctx).Execute()

Get deploy info



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

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminDeployInfoGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminDeployInfoGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminDeployInfoGet`: DeployInfo
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminDeployInfoGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiAdminDeployInfoGetRequest struct via the builder pattern


### Return type

[**DeployInfo**](DeployInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminFeatureFlagsGet

> AdminFeatureFlagsGet200Response AdminFeatureFlagsGet(ctx).Execute()

List feature flags



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

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminFeatureFlagsGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminFeatureFlagsGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminFeatureFlagsGet`: AdminFeatureFlagsGet200Response
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminFeatureFlagsGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiAdminFeatureFlagsGetRequest struct via the builder pattern


### Return type

[**AdminFeatureFlagsGet200Response**](AdminFeatureFlagsGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminFeatureFlagsIdDelete

> AdminFeatureFlagsIdDelete(ctx, id).Execute()

Delete feature flag



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
	id := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.AdminAPI.AdminFeatureFlagsIdDelete(context.Background(), id).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminFeatureFlagsIdDelete``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiAdminFeatureFlagsIdDeleteRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminFeatureFlagsIdPut

> FeatureFlag AdminFeatureFlagsIdPut(ctx, id).AdminFeatureFlagsIdPutRequest(adminFeatureFlagsIdPutRequest).Execute()

Update feature flag



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
	id := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 
	adminFeatureFlagsIdPutRequest := *openapiclient.NewAdminFeatureFlagsIdPutRequest() // AdminFeatureFlagsIdPutRequest |  (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminFeatureFlagsIdPut(context.Background(), id).AdminFeatureFlagsIdPutRequest(adminFeatureFlagsIdPutRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminFeatureFlagsIdPut``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminFeatureFlagsIdPut`: FeatureFlag
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminFeatureFlagsIdPut`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiAdminFeatureFlagsIdPutRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **adminFeatureFlagsIdPutRequest** | [**AdminFeatureFlagsIdPutRequest**](AdminFeatureFlagsIdPutRequest.md) |  | 

### Return type

[**FeatureFlag**](FeatureFlag.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminFeatureFlagsPost

> FeatureFlag AdminFeatureFlagsPost(ctx).AdminFeatureFlagsPostRequest(adminFeatureFlagsPostRequest).Execute()

Create feature flag



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
	adminFeatureFlagsPostRequest := *openapiclient.NewAdminFeatureFlagsPostRequest("Name_example") // AdminFeatureFlagsPostRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminFeatureFlagsPost(context.Background()).AdminFeatureFlagsPostRequest(adminFeatureFlagsPostRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminFeatureFlagsPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminFeatureFlagsPost`: FeatureFlag
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminFeatureFlagsPost`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAdminFeatureFlagsPostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **adminFeatureFlagsPostRequest** | [**AdminFeatureFlagsPostRequest**](AdminFeatureFlagsPostRequest.md) |  | 

### Return type

[**FeatureFlag**](FeatureFlag.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminRevenueExportGet

> string AdminRevenueExportGet(ctx).Format(format).Months(months).Execute()

Export revenue data as CSV (admin)

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
	format := "format_example" // string |  (optional) (default to "csv")
	months := int32(56) // int32 | Number of months to include (optional) (default to 12)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminRevenueExportGet(context.Background()).Format(format).Months(months).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminRevenueExportGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminRevenueExportGet`: string
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminRevenueExportGet`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAdminRevenueExportGetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **format** | **string** |  | [default to &quot;csv&quot;]
 **months** | **int32** | Number of months to include | [default to 12]

### Return type

**string**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/csv

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminRevenueGet

> RevenueResponse AdminRevenueGet(ctx).Execute()

Revenue analytics (admin)



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

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminRevenueGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminRevenueGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminRevenueGet`: RevenueResponse
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminRevenueGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiAdminRevenueGetRequest struct via the builder pattern


### Return type

[**RevenueResponse**](RevenueResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminSdkUpdatePost

> AdminSdkUpdatePost(ctx).AdminSdkUpdatePostRequest(adminSdkUpdatePostRequest).Execute()

Send SDK update notification to users

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
	adminSdkUpdatePostRequest := *openapiclient.NewAdminSdkUpdatePostRequest() // AdminSdkUpdatePostRequest |  (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.AdminAPI.AdminSdkUpdatePost(context.Background()).AdminSdkUpdatePostRequest(adminSdkUpdatePostRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminSdkUpdatePost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAdminSdkUpdatePostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **adminSdkUpdatePostRequest** | [**AdminSdkUpdatePostRequest**](AdminSdkUpdatePostRequest.md) |  | 

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminSettingsGet

> PlatformSettings AdminSettingsGet(ctx).Execute()

Get platform settings (admin)

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

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminSettingsGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminSettingsGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminSettingsGet`: PlatformSettings
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminSettingsGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiAdminSettingsGetRequest struct via the builder pattern


### Return type

[**PlatformSettings**](PlatformSettings.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminSettingsPut

> AdminSettingsPut200Response AdminSettingsPut(ctx).PlatformSettings(platformSettings).Execute()

Update platform settings (admin)

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
	platformSettings := *openapiclient.NewPlatformSettings("DefaultPlan_example", int32(123), int32(123), int32(123), int32(123), int32(123), int32(123), int32(123), int32(123), int32(123), false, false, float64(123), float64(123)) // PlatformSettings | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminSettingsPut(context.Background()).PlatformSettings(platformSettings).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminSettingsPut``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminSettingsPut`: AdminSettingsPut200Response
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminSettingsPut`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAdminSettingsPutRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **platformSettings** | [**PlatformSettings**](PlatformSettings.md) |  | 

### Return type

[**AdminSettingsPut200Response**](AdminSettingsPut200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminStatsGet

> SystemStats AdminStatsGet(ctx).Execute()

System-wide statistics (admin)

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

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminStatsGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminStatsGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminStatsGet`: SystemStats
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminStatsGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiAdminStatsGetRequest struct via the builder pattern


### Return type

[**SystemStats**](SystemStats.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminTestWebhookPost

> AdminTestWebhookResponse AdminTestWebhookPost(ctx).AdminTestWebhookRequest(adminTestWebhookRequest).Execute()

Send a test webhook to a URL (admin)



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
	adminTestWebhookRequest := *openapiclient.NewAdminTestWebhookRequest("EndpointUrl_example", map[string]interface{}(123)) // AdminTestWebhookRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminTestWebhookPost(context.Background()).AdminTestWebhookRequest(adminTestWebhookRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminTestWebhookPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminTestWebhookPost`: AdminTestWebhookResponse
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminTestWebhookPost`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAdminTestWebhookPostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **adminTestWebhookRequest** | [**AdminTestWebhookRequest**](AdminTestWebhookRequest.md) |  | 

### Return type

[**AdminTestWebhookResponse**](AdminTestWebhookResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminUsersExportGet

> string AdminUsersExportGet(ctx).Format(format).Plan(plan).Status(status).Execute()

Export users as CSV (admin)

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
	format := "format_example" // string |  (optional) (default to "csv")
	plan := "plan_example" // string | Filter by plan (optional)
	status := "status_example" // string | Filter by status (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminUsersExportGet(context.Background()).Format(format).Plan(plan).Status(status).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminUsersExportGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminUsersExportGet`: string
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminUsersExportGet`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAdminUsersExportGetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **format** | **string** |  | [default to &quot;csv&quot;]
 **plan** | **string** | Filter by plan | 
 **status** | **string** | Filter by status | 

### Return type

**string**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/csv

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminUsersGet

> PaginatedUsers AdminUsersGet(ctx).Page(page).PerPage(perPage).Search(search).Plan(plan).Status(status).CreatedAfter(createdAfter).CreatedBefore(createdBefore).Execute()

List all users (admin)



### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
    "time"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	page := int32(56) // int32 |  (optional) (default to 1)
	perPage := int32(56) // int32 |  (optional) (default to 20)
	search := "search_example" // string | Search by email or name (ILIKE) (optional)
	plan := "plan_example" // string | Filter by plan (optional)
	status := "status_example" // string | Filter by status (optional)
	createdAfter := time.Now() // string | Filter users created after this date (ISO 8601) (optional)
	createdBefore := time.Now() // string | Filter users created before this date (ISO 8601) (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminUsersGet(context.Background()).Page(page).PerPage(perPage).Search(search).Plan(plan).Status(status).CreatedAfter(createdAfter).CreatedBefore(createdBefore).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminUsersGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminUsersGet`: PaginatedUsers
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminUsersGet`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAdminUsersGetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **int32** |  | [default to 1]
 **perPage** | **int32** |  | [default to 20]
 **search** | **string** | Search by email or name (ILIKE) | 
 **plan** | **string** | Filter by plan | 
 **status** | **string** | Filter by status | 
 **createdAfter** | **string** | Filter users created after this date (ISO 8601) | 
 **createdBefore** | **string** | Filter users created before this date (ISO 8601) | 

### Return type

[**PaginatedUsers**](PaginatedUsers.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminUsersIdAnalyticsGet

> UserAnalytics AdminUsersIdAnalyticsGet(ctx, id).Days(days).Execute()

Get user analytics (admin)



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
	id := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 
	days := int32(56) // int32 | Number of days to analyze (optional) (default to 30)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminUsersIdAnalyticsGet(context.Background(), id).Days(days).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminUsersIdAnalyticsGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminUsersIdAnalyticsGet`: UserAnalytics
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminUsersIdAnalyticsGet`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiAdminUsersIdAnalyticsGetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **days** | **int32** | Number of days to analyze | [default to 30]

### Return type

[**UserAnalytics**](UserAnalytics.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminUsersIdGet

> AdminUsersIdGet200Response AdminUsersIdGet(ctx, id).Execute()

Get user details (admin)



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
	id := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.AdminAPI.AdminUsersIdGet(context.Background(), id).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminUsersIdGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AdminUsersIdGet`: AdminUsersIdGet200Response
	fmt.Fprintf(os.Stdout, "Response from `AdminAPI.AdminUsersIdGet`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiAdminUsersIdGetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**AdminUsersIdGet200Response**](AdminUsersIdGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminUsersIdPlanPut

> AdminUsersIdPlanPut(ctx, id).AdminUsersIdPlanPutRequest(adminUsersIdPlanPutRequest).Execute()

Change user plan (admin)

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
	id := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 
	adminUsersIdPlanPutRequest := *openapiclient.NewAdminUsersIdPlanPutRequest() // AdminUsersIdPlanPutRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.AdminAPI.AdminUsersIdPlanPut(context.Background(), id).AdminUsersIdPlanPutRequest(adminUsersIdPlanPutRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminUsersIdPlanPut``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiAdminUsersIdPlanPutRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **adminUsersIdPlanPutRequest** | [**AdminUsersIdPlanPutRequest**](AdminUsersIdPlanPutRequest.md) |  | 

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AdminUsersIdStatusPut

> AdminUsersIdStatusPut(ctx, id).AdminUsersIdStatusPutRequest(adminUsersIdStatusPutRequest).Execute()

Change user status (admin)

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
	id := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 
	adminUsersIdStatusPutRequest := *openapiclient.NewAdminUsersIdStatusPutRequest() // AdminUsersIdStatusPutRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.AdminAPI.AdminUsersIdStatusPut(context.Background(), id).AdminUsersIdStatusPutRequest(adminUsersIdStatusPutRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AdminAPI.AdminUsersIdStatusPut``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiAdminUsersIdStatusPutRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **adminUsersIdStatusPutRequest** | [**AdminUsersIdStatusPutRequest**](AdminUsersIdStatusPutRequest.md) |  | 

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

