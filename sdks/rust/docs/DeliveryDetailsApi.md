# \DeliveryDetailsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**webhooks_id_attempts_attempt_id_get**](DeliveryDetailsApi.md#webhooks_id_attempts_attempt_id_get) | **GET** /webhooks/{id}/attempts/{attempt_id} | Get specific attempt detail
[**webhooks_id_details_get**](DeliveryDetailsApi.md#webhooks_id_details_get) | **GET** /webhooks/{id}/details | Get detailed delivery info



## webhooks_id_attempts_attempt_id_get

> webhooks_id_attempts_attempt_id_get(id, attempt_id)
Get specific attempt detail

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**attempt_id** | **uuid::Uuid** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## webhooks_id_details_get

> webhooks_id_details_get(id)
Get detailed delivery info

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

