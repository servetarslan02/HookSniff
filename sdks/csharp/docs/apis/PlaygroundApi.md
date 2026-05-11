# hooksniff.Api.PlaygroundApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**PlaygroundGet**](PlaygroundApi.md#playgroundget) | **GET** /playground | Get playground info (endpoints, sample payloads) |
| [**PlaygroundTestPost**](PlaygroundApi.md#playgroundtestpost) | **POST** /playground/test | Test a webhook delivery |

<a id="playgroundget"></a>
# **PlaygroundGet**
> PlaygroundGet200Response PlaygroundGet ()

Get playground info (endpoints, sample payloads)


### Parameters
This endpoint does not need any parameter.
### Return type

[**PlaygroundGet200Response**](PlaygroundGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Playground data |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="playgroundtestpost"></a>
# **PlaygroundTestPost**
> TestWebhookResponse PlaygroundTestPost (TestWebhookRequest testWebhookRequest)

Test a webhook delivery


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **testWebhookRequest** | [**TestWebhookRequest**](TestWebhookRequest.md) |  |  |

### Return type

[**TestWebhookResponse**](TestWebhookResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Test result |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

