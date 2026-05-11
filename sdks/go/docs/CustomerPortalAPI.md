# \CustomerPortalAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**PortalApiKeysGet**](CustomerPortalAPI.md#PortalApiKeysGet) | **Get** /portal/api-keys | List API keys (portal)
[**PortalApiKeysKeyIdDelete**](CustomerPortalAPI.md#PortalApiKeysKeyIdDelete) | **Delete** /portal/api-keys/{key_id} | Revoke API key (portal)
[**PortalApiKeysPost**](CustomerPortalAPI.md#PortalApiKeysPost) | **Post** /portal/api-keys | Create API key (portal)
[**PortalConfigGet**](CustomerPortalAPI.md#PortalConfigGet) | **Get** /portal/config | Get portal configuration
[**PortalConfigPost**](CustomerPortalAPI.md#PortalConfigPost) | **Post** /portal/config | Update portal configuration
[**PortalEmbedCodeGet**](CustomerPortalAPI.md#PortalEmbedCodeGet) | **Get** /portal/embed-code | Get portal embed code
[**PortalMeGet**](CustomerPortalAPI.md#PortalMeGet) | **Get** /portal/me | Get portal profile
[**PortalMePut**](CustomerPortalAPI.md#PortalMePut) | **Put** /portal/me | Update portal profile
[**PortalNotificationsGet**](CustomerPortalAPI.md#PortalNotificationsGet) | **Get** /portal/notifications | Get notification preferences (portal)
[**PortalNotificationsPut**](CustomerPortalAPI.md#PortalNotificationsPut) | **Put** /portal/notifications | Update notification preferences (portal)
[**PortalPlanGet**](CustomerPortalAPI.md#PortalPlanGet) | **Get** /portal/plan | Get plan info (portal)
[**PortalUsageGet**](CustomerPortalAPI.md#PortalUsageGet) | **Get** /portal/usage | Get usage (portal)



## PortalApiKeysGet

> []ApiKeyInfo PortalApiKeysGet(ctx).Execute()

List API keys (portal)

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
	resp, r, err := apiClient.CustomerPortalAPI.PortalApiKeysGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `CustomerPortalAPI.PortalApiKeysGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `PortalApiKeysGet`: []ApiKeyInfo
	fmt.Fprintf(os.Stdout, "Response from `CustomerPortalAPI.PortalApiKeysGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiPortalApiKeysGetRequest struct via the builder pattern


### Return type

[**[]ApiKeyInfo**](ApiKeyInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## PortalApiKeysKeyIdDelete

> PortalApiKeysKeyIdDelete(ctx, keyId).Execute()

Revoke API key (portal)

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
	keyId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.CustomerPortalAPI.PortalApiKeysKeyIdDelete(context.Background(), keyId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `CustomerPortalAPI.PortalApiKeysKeyIdDelete``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**keyId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiPortalApiKeysKeyIdDeleteRequest struct via the builder pattern


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


## PortalApiKeysPost

> CreateApiKeyResponse PortalApiKeysPost(ctx).Execute()

Create API key (portal)

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
	resp, r, err := apiClient.CustomerPortalAPI.PortalApiKeysPost(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `CustomerPortalAPI.PortalApiKeysPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `PortalApiKeysPost`: CreateApiKeyResponse
	fmt.Fprintf(os.Stdout, "Response from `CustomerPortalAPI.PortalApiKeysPost`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiPortalApiKeysPostRequest struct via the builder pattern


### Return type

[**CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## PortalConfigGet

> PortalConfigGet(ctx).Execute()

Get portal configuration

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
	r, err := apiClient.CustomerPortalAPI.PortalConfigGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `CustomerPortalAPI.PortalConfigGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiPortalConfigGetRequest struct via the builder pattern


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


## PortalConfigPost

> PortalConfigPost(ctx).Execute()

Update portal configuration

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
	r, err := apiClient.CustomerPortalAPI.PortalConfigPost(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `CustomerPortalAPI.PortalConfigPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiPortalConfigPostRequest struct via the builder pattern


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


## PortalEmbedCodeGet

> PortalEmbedCodeGet(ctx).Execute()

Get portal embed code

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
	r, err := apiClient.CustomerPortalAPI.PortalEmbedCodeGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `CustomerPortalAPI.PortalEmbedCodeGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiPortalEmbedCodeGetRequest struct via the builder pattern


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


## PortalMeGet

> PortalProfile PortalMeGet(ctx).Execute()

Get portal profile

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
	resp, r, err := apiClient.CustomerPortalAPI.PortalMeGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `CustomerPortalAPI.PortalMeGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `PortalMeGet`: PortalProfile
	fmt.Fprintf(os.Stdout, "Response from `CustomerPortalAPI.PortalMeGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiPortalMeGetRequest struct via the builder pattern


### Return type

[**PortalProfile**](PortalProfile.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## PortalMePut

> PortalMePut(ctx).UpdateProfileRequest(updateProfileRequest).Execute()

Update portal profile

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
	updateProfileRequest := *openapiclient.NewUpdateProfileRequest("Name_example", "Email_example") // UpdateProfileRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.CustomerPortalAPI.PortalMePut(context.Background()).UpdateProfileRequest(updateProfileRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `CustomerPortalAPI.PortalMePut``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiPortalMePutRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **updateProfileRequest** | [**UpdateProfileRequest**](UpdateProfileRequest.md) |  | 

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


## PortalNotificationsGet

> NotificationPreferences PortalNotificationsGet(ctx).Execute()

Get notification preferences (portal)

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
	resp, r, err := apiClient.CustomerPortalAPI.PortalNotificationsGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `CustomerPortalAPI.PortalNotificationsGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `PortalNotificationsGet`: NotificationPreferences
	fmt.Fprintf(os.Stdout, "Response from `CustomerPortalAPI.PortalNotificationsGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiPortalNotificationsGetRequest struct via the builder pattern


### Return type

[**NotificationPreferences**](NotificationPreferences.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## PortalNotificationsPut

> PortalNotificationsPut200Response PortalNotificationsPut(ctx).UpdateNotificationPreferences(updateNotificationPreferences).Execute()

Update notification preferences (portal)

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
	updateNotificationPreferences := *openapiclient.NewUpdateNotificationPreferences(false, false, false) // UpdateNotificationPreferences | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.CustomerPortalAPI.PortalNotificationsPut(context.Background()).UpdateNotificationPreferences(updateNotificationPreferences).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `CustomerPortalAPI.PortalNotificationsPut``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `PortalNotificationsPut`: PortalNotificationsPut200Response
	fmt.Fprintf(os.Stdout, "Response from `CustomerPortalAPI.PortalNotificationsPut`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiPortalNotificationsPutRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **updateNotificationPreferences** | [**UpdateNotificationPreferences**](UpdateNotificationPreferences.md) |  | 

### Return type

[**PortalNotificationsPut200Response**](PortalNotificationsPut200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## PortalPlanGet

> SubscriptionResponse PortalPlanGet(ctx).Execute()

Get plan info (portal)

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
	resp, r, err := apiClient.CustomerPortalAPI.PortalPlanGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `CustomerPortalAPI.PortalPlanGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `PortalPlanGet`: SubscriptionResponse
	fmt.Fprintf(os.Stdout, "Response from `CustomerPortalAPI.PortalPlanGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiPortalPlanGetRequest struct via the builder pattern


### Return type

[**SubscriptionResponse**](SubscriptionResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## PortalUsageGet

> UsageResponse PortalUsageGet(ctx).Execute()

Get usage (portal)

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
	resp, r, err := apiClient.CustomerPortalAPI.PortalUsageGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `CustomerPortalAPI.PortalUsageGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `PortalUsageGet`: UsageResponse
	fmt.Fprintf(os.Stdout, "Response from `CustomerPortalAPI.PortalUsageGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiPortalUsageGetRequest struct via the builder pattern


### Return type

[**UsageResponse**](UsageResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

