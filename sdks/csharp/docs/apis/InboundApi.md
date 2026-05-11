# HookSniff.Sdk.Api.InboundApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**InboundProviderEndpointIdPost**](InboundApi.md#inboundproviderendpointidpost) | **POST** /inbound/{provider}/{endpoint_id} | Receive inbound webhook for a specific endpoint |
| [**InboundProviderPost**](InboundApi.md#inboundproviderpost) | **POST** /inbound/{provider} | Receive inbound webhook from a provider |

<a id="inboundproviderendpointidpost"></a>
# **InboundProviderEndpointIdPost**
> void InboundProviderEndpointIdPost (string provider, Guid endpointId, Object body)

Receive inbound webhook for a specific endpoint


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **provider** | **string** |  |  |
| **endpointId** | **Guid** |  |  |
| **body** | **Object** |  |  |

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
| **200** | Webhook accepted |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="inboundproviderpost"></a>
# **InboundProviderPost**
> void InboundProviderPost (string provider, Object body)

Receive inbound webhook from a provider

Accepts webhooks from external providers (Stripe, GitHub, etc.) and routes them to the customer's endpoints. 


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **provider** | **string** |  |  |
| **body** | **Object** |  |  |

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
| **200** | Webhook accepted |  -  |
| **400** | Invalid payload |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

