# hooksniff.Api.TransformsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**EndpointsEndpointIdTransformsGet**](TransformsApi.md#endpointsendpointidtransformsget) | **GET** /endpoints/{endpoint_id}/transforms | List transform rules for endpoint |
| [**EndpointsEndpointIdTransformsIdDelete**](TransformsApi.md#endpointsendpointidtransformsiddelete) | **DELETE** /endpoints/{endpoint_id}/transforms/{id} | Delete transform rule |
| [**EndpointsEndpointIdTransformsIdPut**](TransformsApi.md#endpointsendpointidtransformsidput) | **PUT** /endpoints/{endpoint_id}/transforms/{id} | Update transform rule |
| [**EndpointsEndpointIdTransformsPost**](TransformsApi.md#endpointsendpointidtransformspost) | **POST** /endpoints/{endpoint_id}/transforms | Create transform rule |
| [**EndpointsEndpointIdTransformsTestPost**](TransformsApi.md#endpointsendpointidtransformstestpost) | **POST** /endpoints/{endpoint_id}/transforms/test | Test a transform rule |

<a id="endpointsendpointidtransformsget"></a>
# **EndpointsEndpointIdTransformsGet**
> List&lt;TransformRule&gt; EndpointsEndpointIdTransformsGet (Guid endpointId)

List transform rules for endpoint


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **endpointId** | **Guid** |  |  |

### Return type

[**List&lt;TransformRule&gt;**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Transform rule list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="endpointsendpointidtransformsiddelete"></a>
# **EndpointsEndpointIdTransformsIdDelete**
> void EndpointsEndpointIdTransformsIdDelete (Guid endpointId, Guid id)

Delete transform rule


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **endpointId** | **Guid** |  |  |
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
| **200** | Rule deleted |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="endpointsendpointidtransformsidput"></a>
# **EndpointsEndpointIdTransformsIdPut**
> TransformRule EndpointsEndpointIdTransformsIdPut (Guid endpointId, Guid id, Object body)

Update transform rule


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **endpointId** | **Guid** |  |  |
| **id** | **Guid** |  |  |
| **body** | **Object** |  |  |

### Return type

[**TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Rule updated |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="endpointsendpointidtransformspost"></a>
# **EndpointsEndpointIdTransformsPost**
> TransformRule EndpointsEndpointIdTransformsPost (Guid endpointId, CreateTransformRuleRequest createTransformRuleRequest)

Create transform rule


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **endpointId** | **Guid** |  |  |
| **createTransformRuleRequest** | [**CreateTransformRuleRequest**](CreateTransformRuleRequest.md) |  |  |

### Return type

[**TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Rule created |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="endpointsendpointidtransformstestpost"></a>
# **EndpointsEndpointIdTransformsTestPost**
> void EndpointsEndpointIdTransformsTestPost (Guid endpointId, EndpointsEndpointIdTransformsTestPostRequest endpointsEndpointIdTransformsTestPostRequest)

Test a transform rule


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **endpointId** | **Guid** |  |  |
| **endpointsEndpointIdTransformsTestPostRequest** | [**EndpointsEndpointIdTransformsTestPostRequest**](EndpointsEndpointIdTransformsTestPostRequest.md) |  |  |

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
| **200** | Transformed output |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

