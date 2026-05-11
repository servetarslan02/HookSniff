# \HealthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**endpoint_health_get**](HealthApi.md#endpoint_health_get) | **GET** /endpoint-health | List endpoint health statuses
[**endpoint_health_id_get**](HealthApi.md#endpoint_health_id_get) | **GET** /endpoint-health/{id} | Get specific endpoint health
[**status_get**](HealthApi.md#status_get) | **GET** /status | System status (public)



## endpoint_health_get

> Vec<models::EndpointHealth> endpoint_health_get()
List endpoint health statuses

### Parameters

This endpoint does not need any parameter.

### Return type

[**Vec<models::EndpointHealth>**](EndpointHealth.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## endpoint_health_id_get

> models::EndpointHealth endpoint_health_id_get(id)
Get specific endpoint health

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

[**models::EndpointHealth**](EndpointHealth.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## status_get

> models::SystemStatus status_get()
System status (public)

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::SystemStatus**](SystemStatus.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

