# \TransformsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**EndpointsEndpointIdTransformsGet**](TransformsAPI.md#EndpointsEndpointIdTransformsGet) | **Get** /endpoints/{endpoint_id}/transforms | List transform rules for endpoint
[**EndpointsEndpointIdTransformsIdDelete**](TransformsAPI.md#EndpointsEndpointIdTransformsIdDelete) | **Delete** /endpoints/{endpoint_id}/transforms/{id} | Delete transform rule
[**EndpointsEndpointIdTransformsIdPut**](TransformsAPI.md#EndpointsEndpointIdTransformsIdPut) | **Put** /endpoints/{endpoint_id}/transforms/{id} | Update transform rule
[**EndpointsEndpointIdTransformsPost**](TransformsAPI.md#EndpointsEndpointIdTransformsPost) | **Post** /endpoints/{endpoint_id}/transforms | Create transform rule
[**EndpointsEndpointIdTransformsTestPost**](TransformsAPI.md#EndpointsEndpointIdTransformsTestPost) | **Post** /endpoints/{endpoint_id}/transforms/test | Test a transform rule



## EndpointsEndpointIdTransformsGet

> []TransformRule EndpointsEndpointIdTransformsGet(ctx, endpointId).Execute()

List transform rules for endpoint

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
	endpointId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.TransformsAPI.EndpointsEndpointIdTransformsGet(context.Background(), endpointId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `TransformsAPI.EndpointsEndpointIdTransformsGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `EndpointsEndpointIdTransformsGet`: []TransformRule
	fmt.Fprintf(os.Stdout, "Response from `TransformsAPI.EndpointsEndpointIdTransformsGet`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**endpointId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiEndpointsEndpointIdTransformsGetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**[]TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## EndpointsEndpointIdTransformsIdDelete

> EndpointsEndpointIdTransformsIdDelete(ctx, endpointId, id).Execute()

Delete transform rule

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
	endpointId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 
	id := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.TransformsAPI.EndpointsEndpointIdTransformsIdDelete(context.Background(), endpointId, id).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `TransformsAPI.EndpointsEndpointIdTransformsIdDelete``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**endpointId** | **string** |  | 
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiEndpointsEndpointIdTransformsIdDeleteRequest struct via the builder pattern


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


## EndpointsEndpointIdTransformsIdPut

> TransformRule EndpointsEndpointIdTransformsIdPut(ctx, endpointId, id).Body(body).Execute()

Update transform rule

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
	endpointId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 
	id := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 
	body := map[string]interface{}{ ... } // map[string]interface{} | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.TransformsAPI.EndpointsEndpointIdTransformsIdPut(context.Background(), endpointId, id).Body(body).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `TransformsAPI.EndpointsEndpointIdTransformsIdPut``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `EndpointsEndpointIdTransformsIdPut`: TransformRule
	fmt.Fprintf(os.Stdout, "Response from `TransformsAPI.EndpointsEndpointIdTransformsIdPut`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**endpointId** | **string** |  | 
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiEndpointsEndpointIdTransformsIdPutRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


 **body** | **map[string]interface{}** |  | 

### Return type

[**TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## EndpointsEndpointIdTransformsPost

> TransformRule EndpointsEndpointIdTransformsPost(ctx, endpointId).CreateTransformRuleRequest(createTransformRuleRequest).Execute()

Create transform rule

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
	endpointId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 
	createTransformRuleRequest := *openapiclient.NewCreateTransformRuleRequest("Name_example", "RuleType_example", map[string]interface{}(123)) // CreateTransformRuleRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.TransformsAPI.EndpointsEndpointIdTransformsPost(context.Background(), endpointId).CreateTransformRuleRequest(createTransformRuleRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `TransformsAPI.EndpointsEndpointIdTransformsPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `EndpointsEndpointIdTransformsPost`: TransformRule
	fmt.Fprintf(os.Stdout, "Response from `TransformsAPI.EndpointsEndpointIdTransformsPost`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**endpointId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiEndpointsEndpointIdTransformsPostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **createTransformRuleRequest** | [**CreateTransformRuleRequest**](CreateTransformRuleRequest.md) |  | 

### Return type

[**TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## EndpointsEndpointIdTransformsTestPost

> EndpointsEndpointIdTransformsTestPost(ctx, endpointId).EndpointsEndpointIdTransformsTestPostRequest(endpointsEndpointIdTransformsTestPostRequest).Execute()

Test a transform rule

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
	endpointId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | 
	endpointsEndpointIdTransformsTestPostRequest := *openapiclient.NewEndpointsEndpointIdTransformsTestPostRequest() // EndpointsEndpointIdTransformsTestPostRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.TransformsAPI.EndpointsEndpointIdTransformsTestPost(context.Background(), endpointId).EndpointsEndpointIdTransformsTestPostRequest(endpointsEndpointIdTransformsTestPostRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `TransformsAPI.EndpointsEndpointIdTransformsTestPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**endpointId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiEndpointsEndpointIdTransformsTestPostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **endpointsEndpointIdTransformsTestPostRequest** | [**EndpointsEndpointIdTransformsTestPostRequest**](EndpointsEndpointIdTransformsTestPostRequest.md) |  | 

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

