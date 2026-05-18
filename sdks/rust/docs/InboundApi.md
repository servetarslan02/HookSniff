# \InboundApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**inbound_configs_get**](InboundApi.md#inbound_configs_get) | **GET** /inbound/configs | List inbound webhook configs
[**inbound_configs_id_delete**](InboundApi.md#inbound_configs_id_delete) | **DELETE** /inbound/configs/{id} | Delete inbound config
[**inbound_configs_id_put**](InboundApi.md#inbound_configs_id_put) | **PUT** /inbound/configs/{id} | Update inbound config
[**inbound_configs_post**](InboundApi.md#inbound_configs_post) | **POST** /inbound/configs | Create inbound webhook config
[**inbound_provider_endpoint_id_post**](InboundApi.md#inbound_provider_endpoint_id_post) | **POST** /inbound/{provider}/{endpoint_id} | Receive inbound webhook for a specific endpoint
[**inbound_provider_post**](InboundApi.md#inbound_provider_post) | **POST** /inbound/{provider} | Receive inbound webhook from a provider



## inbound_configs_get

> Vec<models::InboundConfig> inbound_configs_get()
List inbound webhook configs

Returns all inbound webhook configurations for the authenticated user

### Parameters

This endpoint does not need any parameter.

### Return type

[**Vec<models::InboundConfig>**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## inbound_configs_id_delete

> inbound_configs_id_delete(id)
Delete inbound config

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


## inbound_configs_id_put

> models::InboundConfig inbound_configs_id_put(id, inbound_configs_id_put_request)
Update inbound config

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**inbound_configs_id_put_request** | Option<[**InboundConfigsIdPutRequest**](InboundConfigsIdPutRequest.md)> |  |  |

### Return type

[**models::InboundConfig**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## inbound_configs_post

> models::InboundConfig inbound_configs_post(inbound_configs_post_request)
Create inbound webhook config

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**inbound_configs_post_request** | [**InboundConfigsPostRequest**](InboundConfigsPostRequest.md) |  | [required] |

### Return type

[**models::InboundConfig**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## inbound_provider_endpoint_id_post

> inbound_provider_endpoint_id_post(provider, endpoint_id, body)
Receive inbound webhook for a specific endpoint

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**provider** | **String** |  | [required] |
**endpoint_id** | **uuid::Uuid** |  | [required] |
**body** | **serde_json::Value** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## inbound_provider_post

> inbound_provider_post(provider, body)
Receive inbound webhook from a provider

Accepts webhooks from external providers (Stripe, GitHub, etc.) and routes them to the customer's endpoints. 

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**provider** | **String** |  | [required] |
**body** | **serde_json::Value** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

