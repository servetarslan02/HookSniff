# hooksniff.Api.SchemasApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**SchemasGet**](SchemasApi.md#schemasget) | **GET** /schemas | List registered schemas |
| [**SchemasIdGet**](SchemasApi.md#schemasidget) | **GET** /schemas/{id} | Get schema by ID |
| [**SchemasIdValidatePost**](SchemasApi.md#schemasidvalidatepost) | **POST** /schemas/{id}/validate | Validate an event against a schema |
| [**SchemasPost**](SchemasApi.md#schemaspost) | **POST** /schemas | Register a new JSON Schema |

<a id="schemasget"></a>
# **SchemasGet**
> void SchemasGet ()

List registered schemas


### Parameters
This endpoint does not need any parameter.
### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Schema list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="schemasidget"></a>
# **SchemasIdGet**
> void SchemasIdGet (Guid id)

Get schema by ID


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Schema details |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="schemasidvalidatepost"></a>
# **SchemasIdValidatePost**
> void SchemasIdValidatePost (Guid id, ValidateEventRequest validateEventRequest)

Validate an event against a schema


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **validateEventRequest** | [**ValidateEventRequest**](ValidateEventRequest.md) |  |  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Validation result |  -  |
| **422** | Validation failed |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="schemaspost"></a>
# **SchemasPost**
> void SchemasPost (RegisterSchemaRequest registerSchemaRequest)

Register a new JSON Schema


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **registerSchemaRequest** | [**RegisterSchemaRequest**](RegisterSchemaRequest.md) |  |  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Schema registered |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

