# \WebhooksApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**webhooks_batch_post**](WebhooksApi.md#webhooks_batch_post) | **POST** /webhooks/batch | Send multiple webhooks in batch
[**webhooks_batch_replay_post**](WebhooksApi.md#webhooks_batch_replay_post) | **POST** /webhooks/batch/replay | Replay multiple deliveries by ID
[**webhooks_export_get**](WebhooksApi.md#webhooks_export_get) | **GET** /webhooks/export | Export deliveries as CSV
[**webhooks_get**](WebhooksApi.md#webhooks_get) | **GET** /webhooks | List webhook deliveries
[**webhooks_id_attempts_get**](WebhooksApi.md#webhooks_id_attempts_get) | **GET** /webhooks/{id}/attempts | Get delivery attempts
[**webhooks_id_get**](WebhooksApi.md#webhooks_id_get) | **GET** /webhooks/{id} | Get delivery by ID
[**webhooks_id_replay_post**](WebhooksApi.md#webhooks_id_replay_post) | **POST** /webhooks/{id}/replay | Replay a single delivery
[**webhooks_post**](WebhooksApi.md#webhooks_post) | **POST** /webhooks | Send a webhook



## webhooks_batch_post

> models::BatchResponse webhooks_batch_post(batch_webhook_request)
Send multiple webhooks in batch

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**batch_webhook_request** | [**BatchWebhookRequest**](BatchWebhookRequest.md) |  | [required] |

### Return type

[**models::BatchResponse**](BatchResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## webhooks_batch_replay_post

> webhooks_batch_replay_post(batch_replay_request)
Replay multiple deliveries by ID

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**batch_replay_request** | [**BatchReplayRequest**](BatchReplayRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## webhooks_export_get

> String webhooks_export_get(range)
Export deliveries as CSV

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**range** | Option<**String**> |  |  |[default to 7d]

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/csv

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## webhooks_get

> models::DeliveryListResponse webhooks_get(page, per_page, status, endpoint_id)
List webhook deliveries

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**page** | Option<**i32**> |  |  |[default to 1]
**per_page** | Option<**i32**> |  |  |[default to 20]
**status** | Option<**String**> |  |  |
**endpoint_id** | Option<**uuid::Uuid**> |  |  |

### Return type

[**models::DeliveryListResponse**](DeliveryListResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## webhooks_id_attempts_get

> Vec<models::DeliveryAttempt> webhooks_id_attempts_get(id)
Get delivery attempts

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

[**Vec<models::DeliveryAttempt>**](DeliveryAttempt.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## webhooks_id_get

> models::Delivery webhooks_id_get(id)
Get delivery by ID

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

[**models::Delivery**](Delivery.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## webhooks_id_replay_post

> models::Delivery webhooks_id_replay_post(id)
Replay a single delivery

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

[**models::Delivery**](Delivery.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## webhooks_post

> models::Delivery webhooks_post(create_webhook_request)
Send a webhook

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**create_webhook_request** | [**CreateWebhookRequest**](CreateWebhookRequest.md) |  | [required] |

### Return type

[**models::Delivery**](Delivery.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

