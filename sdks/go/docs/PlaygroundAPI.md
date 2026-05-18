# \PlaygroundAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**PlaygroundGet**](PlaygroundAPI.md#PlaygroundGet) | **Get** /playground | Get playground info (endpoints, sample payloads)
[**PlaygroundTestPost**](PlaygroundAPI.md#PlaygroundTestPost) | **Post** /playground/test | Test a webhook delivery



## PlaygroundGet

> PlaygroundGet200Response PlaygroundGet(ctx).Execute()

Get playground info (endpoints, sample payloads)

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
	resp, r, err := apiClient.PlaygroundAPI.PlaygroundGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `PlaygroundAPI.PlaygroundGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `PlaygroundGet`: PlaygroundGet200Response
	fmt.Fprintf(os.Stdout, "Response from `PlaygroundAPI.PlaygroundGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiPlaygroundGetRequest struct via the builder pattern


### Return type

[**PlaygroundGet200Response**](PlaygroundGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## PlaygroundTestPost

> TestWebhookResponse PlaygroundTestPost(ctx).TestWebhookRequest(testWebhookRequest).Execute()

Test a webhook delivery

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
	testWebhookRequest := *openapiclient.NewTestWebhookRequest("EndpointId_example", map[string]interface{}(123)) // TestWebhookRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.PlaygroundAPI.PlaygroundTestPost(context.Background()).TestWebhookRequest(testWebhookRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `PlaygroundAPI.PlaygroundTestPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `PlaygroundTestPost`: TestWebhookResponse
	fmt.Fprintf(os.Stdout, "Response from `PlaygroundAPI.PlaygroundTestPost`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiPlaygroundTestPostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **testWebhookRequest** | [**TestWebhookRequest**](TestWebhookRequest.md) |  | 

### Return type

[**TestWebhookResponse**](TestWebhookResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

