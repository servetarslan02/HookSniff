# hooksniff.Api.TemplatesApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**TemplatesGet**](TemplatesApi.md#templatesget) | **GET** /templates | List available templates |
| [**TemplatesIdApplyPost**](TemplatesApi.md#templatesidapplypost) | **POST** /templates/{id}/apply | Apply template to an endpoint |
| [**TemplatesIdGet**](TemplatesApi.md#templatesidget) | **GET** /templates/{id} | Get template by ID |

<a id="templatesget"></a>
# **TemplatesGet**
> List&lt;WebhookTemplate&gt; TemplatesGet (string category = null)

List available templates


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **category** | **string** |  | [optional]  |

### Return type

[**List&lt;WebhookTemplate&gt;**](WebhookTemplate.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Template list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="templatesidapplypost"></a>
# **TemplatesIdApplyPost**
> ApplyTemplateResponse TemplatesIdApplyPost (string id, ApplyTemplateRequest applyTemplateRequest)

Apply template to an endpoint


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **string** |  |  |
| **applyTemplateRequest** | [**ApplyTemplateRequest**](ApplyTemplateRequest.md) |  |  |

### Return type

[**ApplyTemplateResponse**](ApplyTemplateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Template applied |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="templatesidget"></a>
# **TemplatesIdGet**
> WebhookTemplate TemplatesIdGet (string id)

Get template by ID


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **string** |  |  |

### Return type

[**WebhookTemplate**](WebhookTemplate.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Template details |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

