# \RoutingApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**endpoints_id_health_get**](RoutingApi.md#endpoints_id_health_get) | **GET** /endpoints/{id}/health | Get endpoint health status
[**endpoints_id_routing_get**](RoutingApi.md#endpoints_id_routing_get) | **GET** /endpoints/{id}/routing | Get routing config for endpoint
[**endpoints_id_routing_put**](RoutingApi.md#endpoints_id_routing_put) | **PUT** /endpoints/{id}/routing | Update routing config



## endpoints_id_health_get

> models::EndpointHealth endpoints_id_health_get(id)
Get endpoint health status

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


## endpoints_id_routing_get

> models::RoutingInfo endpoints_id_routing_get(id)
Get routing config for endpoint

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

[**models::RoutingInfo**](RoutingInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## endpoints_id_routing_put

> models::RoutingInfo endpoints_id_routing_put(id, update_routing_request)
Update routing config

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**update_routing_request** | [**UpdateRoutingRequest**](UpdateRoutingRequest.md) |  | [required] |

### Return type

[**models::RoutingInfo**](RoutingInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

