# \StreamApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**stream_deliveries_get**](StreamApi.md#stream_deliveries_get) | **GET** /stream/deliveries | Real-time delivery event stream (SSE)



## stream_deliveries_get

> String stream_deliveries_get(endpoint_id, status, limit)
Real-time delivery event stream (SSE)

Server-Sent Events stream of webhook deliveries

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**endpoint_id** | Option<**uuid::Uuid**> |  |  |
**status** | Option<**String**> |  |  |
**limit** | Option<**i32**> |  |  |[default to 50]

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/event-stream

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

