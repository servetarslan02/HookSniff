# hooksniff.Api.StreamApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**StreamDeliveriesGet**](StreamApi.md#streamdeliveriesget) | **GET** /stream/deliveries | Real-time delivery event stream (SSE) |

<a id="streamdeliveriesget"></a>
# **StreamDeliveriesGet**
> string StreamDeliveriesGet (Guid endpointId = null, string status = null, int limit = null)

Real-time delivery event stream (SSE)

Server-Sent Events stream of webhook deliveries


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **endpointId** | **Guid** |  | [optional]  |
| **status** | **string** |  | [optional]  |
| **limit** | **int** |  | [optional] [default to 50] |

### Return type

**string**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/event-stream


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | SSE stream |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

