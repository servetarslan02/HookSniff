# \OutboundIPsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**OutboundIpsGet**](OutboundIPsAPI.md#OutboundIpsGet) | **Get** /outbound-ips | Get outbound IP addresses for firewall whitelisting



## OutboundIpsGet

> OutboundIpsResponse OutboundIpsGet(ctx).Execute()

Get outbound IP addresses for firewall whitelisting

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
	resp, r, err := apiClient.OutboundIPsAPI.OutboundIpsGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `OutboundIPsAPI.OutboundIpsGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `OutboundIpsGet`: OutboundIpsResponse
	fmt.Fprintf(os.Stdout, "Response from `OutboundIPsAPI.OutboundIpsGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiOutboundIpsGetRequest struct via the builder pattern


### Return type

[**OutboundIpsResponse**](OutboundIpsResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

