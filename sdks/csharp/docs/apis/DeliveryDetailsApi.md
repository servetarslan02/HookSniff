# hooksniff.Api.DeliveryDetailsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**WebhooksIdAttemptsAttemptIdGet**](DeliveryDetailsApi.md#webhooksidattemptsattemptidget) | **GET** /webhooks/{id}/attempts/{attempt_id} | Get specific attempt detail |
| [**WebhooksIdDetailsGet**](DeliveryDetailsApi.md#webhooksiddetailsget) | **GET** /webhooks/{id}/details | Get detailed delivery info |

<a id="webhooksidattemptsattemptidget"></a>
# **WebhooksIdAttemptsAttemptIdGet**
> void WebhooksIdAttemptsAttemptIdGet (Guid id, Guid attemptId)

Get specific attempt detail


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **attemptId** | **Guid** |  |  |

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
| **200** | Attempt details |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="webhooksiddetailsget"></a>
# **WebhooksIdDetailsGet**
> void WebhooksIdDetailsGet (Guid id)

Get detailed delivery info


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
| **200** | Full delivery details |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

