# hooksniff.Api.WebhooksApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**WebhooksBatchPost**](WebhooksApi.md#webhooksbatchpost) | **POST** /webhooks/batch | Send multiple webhooks in batch |
| [**WebhooksBatchReplayPost**](WebhooksApi.md#webhooksbatchreplaypost) | **POST** /webhooks/batch/replay | Replay multiple deliveries by ID |
| [**WebhooksExportGet**](WebhooksApi.md#webhooksexportget) | **GET** /webhooks/export | Export deliveries as CSV |
| [**WebhooksGet**](WebhooksApi.md#webhooksget) | **GET** /webhooks | List webhook deliveries |
| [**WebhooksIdAttemptsGet**](WebhooksApi.md#webhooksidattemptsget) | **GET** /webhooks/{id}/attempts | Get delivery attempts |
| [**WebhooksIdGet**](WebhooksApi.md#webhooksidget) | **GET** /webhooks/{id} | Get delivery by ID |
| [**WebhooksIdReplayPost**](WebhooksApi.md#webhooksidreplaypost) | **POST** /webhooks/{id}/replay | Replay a single delivery |
| [**WebhooksPost**](WebhooksApi.md#webhookspost) | **POST** /webhooks | Send a webhook |

<a id="webhooksbatchpost"></a>
# **WebhooksBatchPost**
> BatchResponse WebhooksBatchPost (BatchWebhookRequest batchWebhookRequest)

Send multiple webhooks in batch


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **batchWebhookRequest** | [**BatchWebhookRequest**](BatchWebhookRequest.md) |  |  |

### Return type

[**BatchResponse**](BatchResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Batch processed |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="webhooksbatchreplaypost"></a>
# **WebhooksBatchReplayPost**
> void WebhooksBatchReplayPost (BatchReplayRequest batchReplayRequest)

Replay multiple deliveries by ID


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **batchReplayRequest** | [**BatchReplayRequest**](BatchReplayRequest.md) |  |  |

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
| **200** | Batch replay initiated |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="webhooksexportget"></a>
# **WebhooksExportGet**
> string WebhooksExportGet (string range = null)

Export deliveries as CSV


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **range** | **string** |  | [optional] [default to 7d] |

### Return type

**string**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/csv


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | CSV file |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="webhooksget"></a>
# **WebhooksGet**
> DeliveryListResponse WebhooksGet (int page = null, int perPage = null, string status = null, Guid endpointId = null)

List webhook deliveries


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **page** | **int** |  | [optional] [default to 1] |
| **perPage** | **int** |  | [optional] [default to 20] |
| **status** | **string** |  | [optional]  |
| **endpointId** | **Guid** |  | [optional]  |

### Return type

[**DeliveryListResponse**](DeliveryListResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Paginated delivery list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="webhooksidattemptsget"></a>
# **WebhooksIdAttemptsGet**
> List&lt;DeliveryAttempt&gt; WebhooksIdAttemptsGet (Guid id)

Get delivery attempts


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

[**List&lt;DeliveryAttempt&gt;**](DeliveryAttempt.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Attempt list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="webhooksidget"></a>
# **WebhooksIdGet**
> Delivery WebhooksIdGet (Guid id)

Get delivery by ID


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

[**Delivery**](Delivery.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Delivery details |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="webhooksidreplaypost"></a>
# **WebhooksIdReplayPost**
> Delivery WebhooksIdReplayPost (Guid id)

Replay a single delivery


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

[**Delivery**](Delivery.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Replay initiated |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="webhookspost"></a>
# **WebhooksPost**
> Delivery WebhooksPost (CreateWebhookRequest createWebhookRequest)

Send a webhook


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **createWebhookRequest** | [**CreateWebhookRequest**](CreateWebhookRequest.md) |  |  |

### Return type

[**Delivery**](Delivery.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Webhook queued |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

