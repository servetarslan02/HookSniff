# hooksniff.Api.SearchApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**SearchGet**](SearchApi.md#searchget) | **GET** /search | Search deliveries |

<a id="searchget"></a>
# **SearchGet**
> SearchResult SearchGet (string q, string status = null, Guid endpointId = null, int page = null, int perPage = null)

Search deliveries


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **q** | **string** |  |  |
| **status** | **string** |  | [optional]  |
| **endpointId** | **Guid** |  | [optional]  |
| **page** | **int** |  | [optional]  |
| **perPage** | **int** |  | [optional]  |

### Return type

[**SearchResult**](SearchResult.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Search results |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

