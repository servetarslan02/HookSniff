# hooksniff.Api.ContactApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**ContactPost**](ContactApi.md#contactpost) | **POST** /contact | Send contact form message |

<a id="contactpost"></a>
# **ContactPost**
> ContactResponse ContactPost (ContactRequest contactRequest)

Send contact form message


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **contactRequest** | [**ContactRequest**](ContactRequest.md) |  |  |

### Return type

[**ContactResponse**](ContactResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Message sent |  -  |
| **400** | Validation error |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

