# \PlaygroundApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**playground_get**](PlaygroundApi.md#playground_get) | **GET** /playground | Get playground info (endpoints, sample payloads)
[**playground_test_post**](PlaygroundApi.md#playground_test_post) | **POST** /playground/test | Test a webhook delivery



## playground_get

> models::PlaygroundGet200Response playground_get()
Get playground info (endpoints, sample payloads)

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::PlaygroundGet200Response**](_playground_get_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## playground_test_post

> models::TestWebhookResponse playground_test_post(test_webhook_request)
Test a webhook delivery

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**test_webhook_request** | [**TestWebhookRequest**](TestWebhookRequest.md) |  | [required] |

### Return type

[**models::TestWebhookResponse**](TestWebhookResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

