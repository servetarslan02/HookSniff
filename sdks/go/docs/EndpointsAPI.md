# \EndpointsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**EndpointsGet**](EndpointsAPI.md#EndpointsGet) | **Get** /endpoints | List all endpoints
[**EndpointsIdDelete**](EndpointsAPI.md#EndpointsIdDelete) | **Delete** /endpoints/{id} | Delete endpoint
[**EndpointsIdGet**](EndpointsAPI.md#EndpointsIdGet) | **Get** /endpoints/{id} | Get endpoint by ID
[**EndpointsIdPut**](EndpointsAPI.md#EndpointsIdPut) | **Put** /endpoints/{id} | Update endpoint
[**EndpointsIdRetryPolicyPut**](EndpointsAPI.md#EndpointsIdRetryPolicyPut) | **Put** /endpoints/{id}/retry-policy | Update retry policy for an endpoint
[**EndpointsIdRotateSecretPost**](EndpointsAPI.md#EndpointsIdRotateSecretPost) | **Post** /endpoints/{id}/rotate-secret | Rotate endpoint signing secret
[**EndpointsPost**](EndpointsAPI.md#EndpointsPost) | **Post** /endpoints | Create a new endpoint



## EndpointsGet

> []Endpoint EndpointsGet(ctx).Execute()

List all endpoints

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
	resp, r, err := apiClient.EndpointsAPI.EndpointsGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `EndpointsAPI.EndpointsGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `EndpointsGet`: []Endpoint
	fmt.Fprintf(os.Stdout, "Response from `EndpointsAPI.EndpointsGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiEndpointsGetRequest struct via the builder pattern


### Return type

[**[]Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## EndpointsIdDelete

> EndpointsIdDelete(ctx, id).Execute()

Delete endpoint

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
	r, err := apiClient.EndpointsAPI.EndpointsIdDelete(context.Background(), id).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `EndpointsAPI.EndpointsIdDelete``: %v\n", err)
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

Other parameters are passed through a pointer to a apiEndpointsIdDeleteRequest struct via the builder pattern


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


## EndpointsIdGet

> Endpoint EndpointsIdGet(ctx, id).Execute()

Get endpoint by ID

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
	resp, r, err := apiClient.EndpointsAPI.EndpointsIdGet(context.Background(), id).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `EndpointsAPI.EndpointsIdGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `EndpointsIdGet`: Endpoint
	fmt.Fprintf(os.Stdout, "Response from `EndpointsAPI.EndpointsIdGet`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiEndpointsIdGetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## EndpointsIdPut

> Endpoint EndpointsIdPut(ctx, id).UpdateEndpointRequest(updateEndpointRequest).Execute()

Update endpoint

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
	updateEndpointRequest := *openapiclient.NewUpdateEndpointRequest("Url_example", "Description_example", false, []string{"AllowedIps_example"}, []string{"EventFilter_example"}, *openapiclient.NewRetryPolicy(int32(123), "Backoff_example", int32(123), int32(123)), "RoutingStrategy_example", "FallbackUrl_example", "Format_example") // UpdateEndpointRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.EndpointsAPI.EndpointsIdPut(context.Background(), id).UpdateEndpointRequest(updateEndpointRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `EndpointsAPI.EndpointsIdPut``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `EndpointsIdPut`: Endpoint
	fmt.Fprintf(os.Stdout, "Response from `EndpointsAPI.EndpointsIdPut`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiEndpointsIdPutRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **updateEndpointRequest** | [**UpdateEndpointRequest**](UpdateEndpointRequest.md) |  | 

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## EndpointsIdRetryPolicyPut

> Endpoint EndpointsIdRetryPolicyPut(ctx, id).RetryPolicy(retryPolicy).Execute()

Update retry policy for an endpoint

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
	retryPolicy := *openapiclient.NewRetryPolicy(int32(123), "Backoff_example", int32(123), int32(123)) // RetryPolicy | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.EndpointsAPI.EndpointsIdRetryPolicyPut(context.Background(), id).RetryPolicy(retryPolicy).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `EndpointsAPI.EndpointsIdRetryPolicyPut``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `EndpointsIdRetryPolicyPut`: Endpoint
	fmt.Fprintf(os.Stdout, "Response from `EndpointsAPI.EndpointsIdRetryPolicyPut`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiEndpointsIdRetryPolicyPutRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **retryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  | 

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## EndpointsIdRotateSecretPost

> EndpointsIdRotateSecretPost200Response EndpointsIdRotateSecretPost(ctx, id).Execute()

Rotate endpoint signing secret

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
	resp, r, err := apiClient.EndpointsAPI.EndpointsIdRotateSecretPost(context.Background(), id).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `EndpointsAPI.EndpointsIdRotateSecretPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `EndpointsIdRotateSecretPost`: EndpointsIdRotateSecretPost200Response
	fmt.Fprintf(os.Stdout, "Response from `EndpointsAPI.EndpointsIdRotateSecretPost`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiEndpointsIdRotateSecretPostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**EndpointsIdRotateSecretPost200Response**](EndpointsIdRotateSecretPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## EndpointsPost

> Endpoint EndpointsPost(ctx).CreateEndpointRequest(createEndpointRequest).Execute()

Create a new endpoint

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
	createEndpointRequest := *openapiclient.NewCreateEndpointRequest("Url_example") // CreateEndpointRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.EndpointsAPI.EndpointsPost(context.Background()).CreateEndpointRequest(createEndpointRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `EndpointsAPI.EndpointsPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `EndpointsPost`: Endpoint
	fmt.Fprintf(os.Stdout, "Response from `EndpointsAPI.EndpointsPost`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiEndpointsPostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createEndpointRequest** | [**CreateEndpointRequest**](CreateEndpointRequest.md) |  | 

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

