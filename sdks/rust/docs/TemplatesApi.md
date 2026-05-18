# \TemplatesApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**templates_get**](TemplatesApi.md#templates_get) | **GET** /templates | List available templates
[**templates_id_apply_post**](TemplatesApi.md#templates_id_apply_post) | **POST** /templates/{id}/apply | Apply template to an endpoint
[**templates_id_get**](TemplatesApi.md#templates_id_get) | **GET** /templates/{id} | Get template by ID



## templates_get

> Vec<models::WebhookTemplate> templates_get(category)
List available templates

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**category** | Option<**String**> |  |  |

### Return type

[**Vec<models::WebhookTemplate>**](WebhookTemplate.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## templates_id_apply_post

> models::ApplyTemplateResponse templates_id_apply_post(id, apply_template_request)
Apply template to an endpoint

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **String** |  | [required] |
**apply_template_request** | [**ApplyTemplateRequest**](ApplyTemplateRequest.md) |  | [required] |

### Return type

[**models::ApplyTemplateResponse**](ApplyTemplateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## templates_id_get

> models::WebhookTemplate templates_id_get(id)
Get template by ID

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **String** |  | [required] |

### Return type

[**models::WebhookTemplate**](WebhookTemplate.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

