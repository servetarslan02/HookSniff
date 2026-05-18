# \TransformsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**endpoints_endpoint_id_transforms_get**](TransformsApi.md#endpoints_endpoint_id_transforms_get) | **GET** /endpoints/{endpoint_id}/transforms | List transform rules for endpoint
[**endpoints_endpoint_id_transforms_id_delete**](TransformsApi.md#endpoints_endpoint_id_transforms_id_delete) | **DELETE** /endpoints/{endpoint_id}/transforms/{id} | Delete transform rule
[**endpoints_endpoint_id_transforms_id_put**](TransformsApi.md#endpoints_endpoint_id_transforms_id_put) | **PUT** /endpoints/{endpoint_id}/transforms/{id} | Update transform rule
[**endpoints_endpoint_id_transforms_post**](TransformsApi.md#endpoints_endpoint_id_transforms_post) | **POST** /endpoints/{endpoint_id}/transforms | Create transform rule
[**endpoints_endpoint_id_transforms_test_post**](TransformsApi.md#endpoints_endpoint_id_transforms_test_post) | **POST** /endpoints/{endpoint_id}/transforms/test | Test a transform rule



## endpoints_endpoint_id_transforms_get

> Vec<models::TransformRule> endpoints_endpoint_id_transforms_get(endpoint_id)
List transform rules for endpoint

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**endpoint_id** | **uuid::Uuid** |  | [required] |

### Return type

[**Vec<models::TransformRule>**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## endpoints_endpoint_id_transforms_id_delete

> endpoints_endpoint_id_transforms_id_delete(endpoint_id, id)
Delete transform rule

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**endpoint_id** | **uuid::Uuid** |  | [required] |
**id** | **uuid::Uuid** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## endpoints_endpoint_id_transforms_id_put

> models::TransformRule endpoints_endpoint_id_transforms_id_put(endpoint_id, id, body)
Update transform rule

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**endpoint_id** | **uuid::Uuid** |  | [required] |
**id** | **uuid::Uuid** |  | [required] |
**body** | **serde_json::Value** |  | [required] |

### Return type

[**models::TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## endpoints_endpoint_id_transforms_post

> models::TransformRule endpoints_endpoint_id_transforms_post(endpoint_id, create_transform_rule_request)
Create transform rule

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**endpoint_id** | **uuid::Uuid** |  | [required] |
**create_transform_rule_request** | [**CreateTransformRuleRequest**](CreateTransformRuleRequest.md) |  | [required] |

### Return type

[**models::TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## endpoints_endpoint_id_transforms_test_post

> endpoints_endpoint_id_transforms_test_post(endpoint_id, endpoints_endpoint_id_transforms_test_post_request)
Test a transform rule

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**endpoint_id** | **uuid::Uuid** |  | [required] |
**endpoints_endpoint_id_transforms_test_post_request** | [**EndpointsEndpointIdTransformsTestPostRequest**](EndpointsEndpointIdTransformsTestPostRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

